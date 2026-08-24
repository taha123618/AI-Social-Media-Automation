import { z } from "zod";
import prisma from "@/lib/prisma";
import { ContentStatus, UserRole } from "@/app/generated/prisma/enums";
import nodemailer from "nodemailer";
import { SystemLogger } from "@/features/system/services/logger.service";

// Zod schemas for validation
const CommentSchema = z.object({
  draftId: z.string(),
  authorId: z.string(),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const NotificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    "DRAFT_ASSIGNED",
    "DRAFT_APPROVED",
    "DRAFT_REJECTED",
    "COMMENT_MENTION",
    "COMMENT_REPLY",
    "SUBSCRIPTION_EXPIRING",
    "USAGE_LIMIT_WARNING"
  ]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  entityId: z.string().optional(),
  entityType: z.enum(["CONTENT_DRAFT", "DRAFT_COMMENT", "BUSINESS", "ORGANIZATION"]).optional(),
});

export type CommentInput = z.infer<typeof CommentSchema>;
export type NotificationInput = z.infer<typeof NotificationSchema>;

export class ReviewService {
  /**
   * Add a comment to a content draft
   */
  static async addComment(input: CommentInput): Promise<{ commentId: string }> {
    const validatedInput = CommentSchema.parse(input);

    // Verify draft exists and user has access
    const draft = await prisma.contentDraft.findUnique({
      where: { id: validatedInput.draftId },
      include: { business: true }
    });

    if (!draft) {
      throw new Error(`Draft not found: ${validatedInput.draftId}`);
    }

    // Create comment
    const comment = await prisma.draftComment.create({
      data: {
        draftId: validatedInput.draftId,
        authorId: validatedInput.authorId,
        content: validatedInput.content,
        parentId: validatedInput.parentId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        parent: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Send notifications
    await this.sendCommentNotifications({
      id: comment.id,
      authorId: comment.authorId,
      content: comment.content,
      parentId: comment.parentId || undefined,
      author: { name: comment.author.name },
      parent: comment.parent ? {
        authorId: comment.parent.authorId,
        author: { name: comment.parent.author.name }
      } : undefined
    }, {
      id: draft.id,
      title: draft.title || undefined,
      creatorId: draft.creatorId
    });

    // Track manual override if content is being edited
    if (draft.contentJson) {
      await this.trackManualOverride(
        validatedInput.draftId,
        validatedInput.authorId,
        validatedInput.content
      );
    }

    await SystemLogger.logActivity({
      action: "DRAFT_COMMENT_ADDED",
      entity: "ContentDraft",
      entityId: validatedInput.draftId,
      details: { authorId: validatedInput.authorId, businessId: draft.businessId }
    });

    return { commentId: comment.id };
  }

  /**
   * Resolve a comment thread
   */
  static async resolveComment(commentId: string, userId: string): Promise<void> {
    const comment = await prisma.draftComment.findUnique({
      where: { id: commentId },
      include: { draft: true }
    });

    if (!comment) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    // Check if user has permission to resolve (author, draft creator, or business owner)
    const draft = comment.draft;
    const isAuthorized =
      comment.authorId === userId ||
      draft.creatorId === userId ||
      (await this.isUserBusinessOwner(userId, draft.businessId));

    if (!isAuthorized) {
      throw new Error("Unauthorized to resolve this comment");
    }

    await prisma.draftComment.update({
      where: { id: commentId },
      data: { resolved: true }
    });

    await SystemLogger.logActivity({
      action: "DRAFT_COMMENT_RESOLVED",
      entity: "DraftComment",
      entityId: commentId,
      details: { userId, draftId: draft.id }
    });

    // Send resolution notification
    await this.createNotification({
      userId: comment.authorId,
      type: "COMMENT_REPLY",
      title: "Comment Resolved",
      message: `Your comment on "${draft.title || 'untitled draft'}" has been resolved`,
      entityId: draft.id,
      entityType: "CONTENT_DRAFT"
    });
  }

  /**
   * Review and approve/reject a draft
   */
  static async reviewDraft(
    draftId: string,
    reviewerId: string,
    decision: "APPROVE" | "REJECT",
    comment?: string
  ): Promise<{ newStatus: ContentStatus }> {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
      include: {
        business: true,
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!draft) {
      throw new Error(`Draft not found: ${draftId}`);
    }

    // Verify reviewer has approver role
    const hasPermission = await this.userHasRole(reviewerId, draft.businessId, ["APPROVER", "OWNER"]);
    if (!hasPermission) {
      throw new Error("User does not have permission to review drafts");
    }

    // Update draft status
    const newStatus = decision === "APPROVE" ? ContentStatus.APPROVED : ContentStatus.REJECTED;

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: draftId },
      data: { status: newStatus }
    });

    // Create approval log
    await prisma.approvalLog.create({
      data: {
        draftId,
        userId: reviewerId,
        status: newStatus,
        comment: comment || undefined
      }
    });

    // Send notification to creator
    await this.createNotification({
      userId: draft.creatorId,
      type: decision === "APPROVE" ? "DRAFT_APPROVED" : "DRAFT_REJECTED",
      title: `Draft ${decision === "APPROVE" ? "Approved" : "Rejected"}`,
      message: `Your draft "${draft.title || 'untitled'}" has been ${decision === "APPROVE" ? "approved" : "rejected"}${comment ? `: ${comment}` : ""}`,
      entityId: draftId,
      entityType: "CONTENT_DRAFT"
    });

    await SystemLogger.logActivity({
      action: "DRAFT_REVIEWED",
      entity: "ContentDraft",
      entityId: draftId,
      details: { reviewerId, decision, businessId: draft.businessId }
    });

    return { newStatus };
  }

  /**
   * Get comments for a draft with threading
   */
  static async getDraftComments(draftId: string) {
    return await prisma.draftComment.findMany({
      where: { draftId },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        parent: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          }
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, image: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  /**
   * Create a notification
   */
  static async createNotification(input: NotificationInput): Promise<{ notificationId: string }> {
    const validatedInput = NotificationSchema.parse(input);

    const notification = await prisma.notification.create({
      data: validatedInput
    });

    // Send email notification (in background)
    this.sendEmailNotification(notification).catch(console.error);

    await SystemLogger.logActivity({
      action: "NOTIFICATION_CREATED",
      entity: "Notification",
      entityId: notification.id,
      details: { userId: validatedInput.userId, type: validatedInput.type }
    });

    return { notificationId: notification.id };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  /**
   * Get user's unread notifications
   */
  static async getUserNotifications(userId: string, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  /**
   * Assign draft to user for review
   */
  static async assignDraft(draftId: string, assigneeId: string, assignedById: string): Promise<void> {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
      include: {
        business: true,
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!draft) {
      throw new Error(`Draft not found: ${draftId}`);
    }

    // Verify assigner has permission
    const hasPermission = await this.userHasRole(assignedById, draft.businessId, ["OWNER", "ADMIN"]);
    if (!hasPermission) {
      throw new Error("Unauthorized to assign drafts");
    }

    // Update draft
    await prisma.contentDraft.update({
      where: { id: draftId },
      data: { creatorId: assigneeId } // Reassign ownership for review
    });

    // Create assignment notification
    await this.createNotification({
      userId: assigneeId,
      type: "DRAFT_ASSIGNED",
      title: "Draft Assigned for Review",
      message: `You have been assigned to review "${draft.title || 'untitled draft'}" by ${(await prisma.user.findUnique({ where: { id: assignedById } }))?.name || 'a team member'}`,
      entityId: draftId,
      entityType: "CONTENT_DRAFT"
    });

    await SystemLogger.logActivity({
      action: "DRAFT_ASSIGNED",
      entity: "ContentDraft",
      entityId: draftId,
      details: { assigneeId, assignedById, businessId: draft.businessId }
    });
  }

  // Private helper methods

  private static async sendCommentNotifications(
    comment: {
      id: string;
      authorId: string;
      content: string;
      parentId?: string;
      author: { name: string };
      parent?: { authorId: string; author: { name: string } }
    },
    draft: {
      id: string;
      title?: string;
      creatorId: string
    }
  ): Promise<void> {
    const notifications = [];

    // Notify draft creator
    if (comment.authorId !== draft.creatorId) {
      notifications.push(this.createNotification({
        userId: draft.creatorId,
        type: "COMMENT_MENTION",
        title: "New Comment on Your Draft",
        message: `${comment.author.name} commented on your draft "${draft.title || 'untitled'}"`,
        entityId: draft.id,
        entityType: "CONTENT_DRAFT"
      }));
    }

    // Notify parent comment author (reply)
    if (comment.parentId && comment.parent && comment.parent.authorId !== comment.authorId) {
      notifications.push(this.createNotification({
        userId: comment.parent.authorId,
        type: "COMMENT_REPLY",
        title: "Reply to Your Comment",
        message: `${comment.author.name} replied to your comment on "${draft.title || 'untitled'}"`,
        entityId: draft.id,
        entityType: "CONTENT_DRAFT"
      }));
    }

    // Notify mentioned users (@mentions)
    const mentions = comment.content.match(/@(\w+)/g);
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1);
        const mentionedUser = await prisma.user.findFirst({
          where: {
            OR: [
              { name: { contains: username, mode: "insensitive" } },
              { email: { contains: username, mode: "insensitive" } }
            ]
          }
        });

        if (mentionedUser && mentionedUser.id !== comment.authorId) {
          notifications.push(this.createNotification({
            userId: mentionedUser.id,
            type: "COMMENT_MENTION",
            title: "You Were Mentioned",
            message: `${comment.author.name} mentioned you in a comment on "${draft.title || 'untitled'}"`,
            entityId: draft.id,
            entityType: "CONTENT_DRAFT"
          }));
        }
      }
    }

    await Promise.all(notifications);
  }

  private static async trackManualOverride(
    draftId: string,
    userId: string,
    content: string
  ): Promise<void> {
    // Store the manual edit for AI learning
    await prisma.manualOverride.create({
      data: {
        draftId,
        userId,
        originalContent: "", // Would capture original AI content
        modifiedContent: content,
        reason: "User comment/edit"
      }
    });
  }

  private static async isUserBusinessOwner(userId: string, businessId: string): Promise<boolean> {
    const membership = await prisma.businessMember.findFirst({
      where: {
        userId,
        businessId,
        role: "OWNER"
      }
    });
    return !!membership;
  }

  private static async userHasRole(
    userId: string,
    businessId: string,
    roles: string[]
  ): Promise<boolean> {
    const membership = await prisma.businessMember.findFirst({
      where: {
        userId,
        businessId,
        role: { in: roles as UserRole[] }
      }
    });
    return !!membership;
  }

  private static async sendEmailNotification(notification: {
    userId: string;
    title: string;
    message: string
  }): Promise<void> {
    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: notification.userId }
    });

    if (!user?.email) return;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            <p style="font-size: 12px; color: #666;">
              This is an automated notification from AI Social Media Automation
            </p>
          </div>
        `
      });
    } catch (error: any) {
      console.error("Failed to send email notification:", error);
      await SystemLogger.logError({
        message: error.message || "Email notification failed",
        source: "ReviewService.sendEmailNotification",
        context: { userId: notification.userId, title: notification.title }
      });
    }
  }
}

// Extend Prisma schema with manual override model
// This would typically be in prisma/schema.prisma but included here for completeness
/*
model ManualOverride {
  id              String     @id @default(cuid())
  draftId         String
  userId          String
  originalContent String
  modifiedContent String
  reason          String?
  createdAt       DateTime   @default(now())
  draft           ContentDraft @relation(fields: [draftId], references: [id], onDelete: Cascade)
  user            User       @relation(fields: [userId], references: [id])

  @@index([draftId])
  @@index([userId, createdAt])
}
*/