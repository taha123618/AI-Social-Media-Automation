"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAdminToken, setAdminSession, removeAdminSession, getAdminSession } from "@/lib/admin-auth";
import { sendAdminInvitationEmail } from "@/lib/email-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PLANS, PlanId } from "@/features/billing/config/plans.config";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  planId: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  billingStatus: z.enum(["ACTIVE", "PAUSED", "CANCELED", "PAST_DUE", "TRIALING"]).optional(),
});

const businessSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  website: z.string().url().optional().or(z.literal("")),
});

const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["super_admin", "admin"]),
});

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log(`[Login] Attempting login for: ${email}`);

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log(`[Login] Admin not found: ${email}`);
      return { error: "Invalid email or password" };
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      console.log(`[Login] Incorrect password for: ${email}`);
      return { error: "Invalid email or password" };
    }

    console.log(`[Login] Authentication successful for: ${email}, signing token...`);

    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await setAdminSession(token);
    console.log(`[Login] Session set, redirecting to /admin/dashboard`);
    redirect("/admin/dashboard");
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT" || error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[Login] Unexpected error during login:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAdmin() {
  await removeAdminSession();
  redirect("/admin/login");
}

export async function getAdmins() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  return await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdmin(data: z.infer<typeof adminSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  const validatedData = adminSchema.parse(data);

  if (!validatedData.password) {
    throw new Error("Password is required for new admin");
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  const admin = await prisma.admin.create({
    data: {
      ...validatedData,
      password: hashedPassword,
    },
  });

  // Send invitation email
  try {
    await sendAdminInvitationEmail(admin.email, admin.name, admin.role);
  } catch (emailError) {
    console.error("Failed to send admin invitation email:", emailError);
    // We don't throw here to avoid failing the whole admin creation if only email fails
  }

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function updateAdmin(id: string, data: z.infer<typeof adminSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  const validatedData = adminSchema.parse(data);

  const updateData: any = {
    name: validatedData.name,
    email: validatedData.email,
    role: validatedData.role,
  };

  if (validatedData.password) {
    updateData.password = await bcrypt.hash(validatedData.password, 12);
  }

  await prisma.admin.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function deleteAdmin(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  await prisma.admin.delete({
    where: { id },
  });

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function getAdminById(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  return await prisma.admin.findUnique({
    where: { id }
  });
}

export async function globalSearch(query: string) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!query || query.length < 2) return { admins: [], users: [], organizations: [] };

  const [admins, users, organizations] = await Promise.all([
    prisma.admin.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, name: true, email: true },
    }),
    prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, name: true, slug: true },
    }),
  ]);

  // Modern relevance mapping & scoring
  const processResults = (items: any[], type: string) => {
    return items.map(item => {
      const targetString = (item.name + " " + (item.email || item.slug || "")).toLowerCase();
      const score = targetString.startsWith(query.toLowerCase()) ? 2 : 1;
      return { ...item, type, score };
    }).sort((a, b) => b.score - a.score);
  };

  return {
    admins: processResults(admins, 'administrative_node'),
    users: processResults(users, 'identity_node'),
    organizations: processResults(organizations, 'organizational_unit')
  };
}

export async function getUsers() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      ownedOrganizations: {
        select: {
          id: true,
          name: true,
          subscriptions: {
            select: {
              planId: true,
              status: true,
            },
          },
        },
      },
      organizationMemberships: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              subscriptions: {
                select: {
                  planId: true,
                  status: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          memberships: true,
          workflows: true,
        },
      },
    },
  });

  return users.map((u) => {
    const org = u.ownedOrganizations[0] || u.organizationMemberships[0]?.organization;
    const sub = org?.subscriptions;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      plan: sub?.planId?.toLowerCase() || "free",
      billingStatus: sub?.status || "ACTIVE",
      _count: u._count,
    };
  });
}

export async function getUserBillingDetails(userId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      ownedOrganizations: {
        include: {
          subscriptions: {
            include: {
              usage: true,
            },
          },
        },
      },
      organizationMemberships: {
        include: {
          organization: {
            include: {
              subscriptions: {
                include: {
                  usage: true,
                },
              },
            },
          },
        },
      },
      auditLogs: {
        where: {
          action: "ADMIN_OVERRIDE_SUBSCRIPTION",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const organization = user.ownedOrganizations[0] || user.organizationMemberships[0]?.organization;
  const subscription = organization?.subscriptions;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
        }
      : null,
    subscription: subscription
      ? {
          id: subscription.id,
          planId: subscription.planId.toLowerCase(),
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          usage: subscription.usage,
        }
      : null,
    auditLogs: user.auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
    })),
  };
}

export async function updateUserBillingPlan(
  userId: string,
  data: {
    planId: string;
    status?: "ACTIVE" | "PAUSED" | "CANCELED" | "PAST_DUE" | "TRIALING";
    reason?: string;
  }
) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const targetPlan = data.planId.toLowerCase() as PlanId;
  const planConfig = PLANS[targetPlan] || PLANS.free;
  const subscriptionStatus = data.status || "ACTIVE";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedOrganizations: {
        include: {
          subscriptions: true,
        },
      },
      organizationMemberships: {
        include: {
          organization: {
            include: {
              subscriptions: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Target user identity not found");
  }

  let organization = user.ownedOrganizations[0] || user.organizationMemberships[0]?.organization;

  // If user has no organization yet, provision one automatically
  if (!organization) {
    const slug = `${user.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${user.id.slice(-5)}`;
    organization = await prisma.organization.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        subscriptions: true,
      },
    });
  }

  const previousPlan = organization.subscriptions?.planId?.toLowerCase() || "free";
  const previousStatus = organization.subscriptions?.status || "ACTIVE";
  const now = new Date();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  // Atomic database update
  const updatedSubscription = await prisma.subscription.upsert({
    where: {
      organizationId: organization.id,
    },
    create: {
      organizationId: organization.id,
      planId: targetPlan.toUpperCase(),
      status: subscriptionStatus,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    update: {
      planId: targetPlan.toUpperCase(),
      status: subscriptionStatus,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  // Sync / Reset Usage Limits for the new Plan
  const featuresToSync = [
    { feature: "AI_POSTS" as const, limit: planConfig.features.ai_posts },
    { feature: "AI_BLOG_ARTICLES" as const, limit: planConfig.features.ai_articles },
    { feature: "TEAM_MEMBERS" as const, limit: planConfig.features.team_collaboration ? 10 : 1 },
  ];

  for (const item of featuresToSync) {
    await prisma.subscriptionUsage.upsert({
      where: {
        subscriptionId_feature_period: {
          subscriptionId: updatedSubscription.id,
          feature: item.feature,
          period: "MONTHLY",
        },
      },
      create: {
        subscriptionId: updatedSubscription.id,
        feature: item.feature,
        used: 0,
        limit: item.limit,
        period: "MONTHLY",
        resetDate: periodEnd,
      },
      update: {
        limit: item.limit,
        resetDate: periodEnd,
      },
    });
  }

  // Create Audit Log Entry
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_OVERRIDE_SUBSCRIPTION",
      resource: `User:${userId}`,
      userId: user.id,
      status: "SUCCESS",
      details: {
        adminId: session.id,
        adminEmail: session.email,
        adminRole: session.role,
        previousPlan,
        previousStatus,
        newPlan: targetPlan,
        newStatus: subscriptionStatus,
        reason: data.reason || "Manual override via Administrator Control",
        timestamp: now.toISOString(),
      },
    },
  });

  // Revalidate user and admin routes
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/edit/${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/settings/billing");

  return {
    success: true,
    plan: targetPlan,
    status: subscriptionStatus,
  };
}

export async function createUser(data: z.infer<typeof userSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  const validatedData = userSchema.parse(data);
  const hashedPassword = validatedData.password
    ? await bcrypt.hash(validatedData.password, 12)
    : undefined;

  const user = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      accounts: hashedPassword
        ? {
            create: {
              type: "credentials",
              password: hashedPassword,
              providerId: "credentials",
              accountId: validatedData.email,
            },
          }
        : undefined,
    },
  });

  const targetPlan = (validatedData.planId || "free").toLowerCase() as PlanId;
  const planConfig = PLANS[targetPlan] || PLANS.free;
  const status = validatedData.billingStatus || "ACTIVE";
  const slug = `${validatedData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${user.id.slice(-5)}`;
  const now = new Date();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const org = await prisma.organization.create({
    data: {
      name: `${validatedData.name}'s Workspace`,
      slug,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
      subscriptions: {
        create: {
          planId: targetPlan.toUpperCase(),
          status: status as any,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          usage: {
            create: [
              {
                feature: "AI_POSTS",
                used: 0,
                limit: planConfig.features.ai_posts,
                period: "MONTHLY",
                resetDate: periodEnd,
              },
              {
                feature: "AI_BLOG_ARTICLES",
                used: 0,
                limit: planConfig.features.ai_articles,
                period: "MONTHLY",
                resetDate: periodEnd,
              },
              {
                feature: "TEAM_MEMBERS",
                used: 0,
                limit: planConfig.features.team_collaboration ? 10 : 1,
                period: "MONTHLY",
                resetDate: periodEnd,
              },
            ],
          },
        },
      },
    },
  });

  // Create initial Business workspace under the organization
  await prisma.business.create({
    data: {
      name: `${validatedData.name}'s Brand`,
      slug: `${slug}-brand`,
      organizationId: org.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_CREATE_USER",
      resource: `User:${user.id}`,
      userId: user.id,
      status: "SUCCESS",
      details: {
        adminId: session.id,
        adminEmail: session.email,
        initialPlan: targetPlan,
        billingStatus: status,
      },
    },
  });

  revalidatePath("/admin/users");
  return { success: true, userId: user.id };
}

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  const validatedData = userSchema.parse(data);

  await prisma.user.update({
    where: { id },
    data: {
      name: validatedData.name,
      email: validatedData.email,
    }
  });

  if (validatedData.password) {
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    await prisma.account.updateMany({
      where: { userId: id, providerId: "credentials" },
      data: { password: hashedPassword }
    });
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function sendMessageToUser(userId: string, body: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  // Mock implementation for administrative messaging
  console.log(`[Admin Message] Logic to send message to user ${userId}: ${body}`);

  // In a real scenario, this would create a Notification record or send an email
  await prisma.notification.create({
    data: {
      userId,
      title: "Administrator Message",
      message: body,
      type: "SYSTEM",
    }
  });

  return { success: true };
}

export async function getWorkflows() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.workflow.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true } },
      creator: { select: { name: true } },
    }
  });
}

export async function updateWorkflowConfig(id: string, config: any) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.workflow.update({
    where: { id },
    data: { trigger: config } // Assuming trigger holds the main config for this version
  });

  revalidatePath("/admin/workflows");
  return { success: true };
}

export async function toggleWorkflowStatus(id: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.workflow.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath("/admin/workflows");
  return { success: true };
}

export async function deleteWorkflow(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.workflow.delete({ where: { id } });
  revalidatePath("/admin/workflows");
  return { success: true };
}

export async function getSocialAccounts() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.socialAccount.findMany({
    orderBy: { businessId: "asc" },
    include: {
      business: { select: { name: true } },
    }
  });
}

export async function updateSocialAccountStatus(id: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.socialAccount.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath("/admin/social-accounts");
  return { success: true };
}

export async function deleteSocialAccount(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.socialAccount.delete({ where: { id } });
  revalidatePath("/admin/social-accounts");
  return { success: true };
}

export async function getBusinesses() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true } },
      _count: {
        select: {
          members: true,
          socialAccounts: true,
          workflows: true,
        }
      }
    }
  });
}

export async function createBusiness(data: z.infer<typeof businessSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  const validatedData = businessSchema.parse(data);

  await prisma.business.create({
    data: {
      name: validatedData.name,
      slug: validatedData.slug,
      website: validatedData.website || null,
    }
  });

  revalidatePath("/admin/workspaces");
  return { success: true };
}

export async function updateBusiness(id: string, data: z.infer<typeof businessSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  const validatedData = businessSchema.parse(data);

  await prisma.business.update({
    where: { id },
    data: {
      name: validatedData.name,
      slug: validatedData.slug,
      website: validatedData.website || null,
    }
  });

  revalidatePath("/admin/workspaces");
  return { success: true };
}

export async function deleteBusiness(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  await prisma.business.delete({ where: { id } });
  revalidatePath("/admin/workspaces");
  return { success: true };
}

export async function manualLinkAccount(data: {
  businessId: string;
  platform: string;
  name: string;
  accountId?: string;
  accessToken?: string;
}) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  // Map X to TWITTER if needed
  const platformMap: Record<string, any> = {
    "X": "TWITTER",
    "INSTAGRAM": "INSTAGRAM",
    "LINKEDIN": "LINKEDIN",
    "FACEBOOK": "FACEBOOK",
  };

  const platformValue = platformMap[data.platform] || data.platform;

  await prisma.socialAccount.create({
    data: {
      businessId: data.businessId,
      platform: platformValue as any,
      platformId: data.accountId || `manual-${Date.now()}`,
      name: data.name,
      accessToken: data.accessToken || null,
      isActive: true,
    }
  });

  revalidatePath("/admin/social-accounts");
  return { success: true };
}

// ----------------------------------------------------
// Complete Admin Billing & Subscriptions Management
// ----------------------------------------------------

export async function getAdminBillingOverview() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const [subscriptions, organizations, webhooks, auditLogs] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            businesses: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                members: true,
                businesses: true,
              },
            },
          },
        },
        usage: true,
      },
      orderBy: {
        startDate: "desc",
      },
    }),
    prisma.organization.findMany({
      where: {
        subscriptions: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.auditLog.findMany({
      where: {
        action: {
          in: ["ADMIN_OVERRIDE_SUBSCRIPTION", "ADMIN_RESET_USAGE", "ADMIN_CREATE_USER"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  // Aggregate stats
  const planPrices: Record<string, number> = {
    free: 0,
    starter: 29,
    pro: 99,
    enterprise: 299,
  };

  let mrr = 0;
  let activeCount = 0;
  let trialingCount = 0;
  let pausedCount = 0;
  let canceledCount = 0;
  let pastDueCount = 0;

  const planDistribution: Record<string, number> = {
    free: 0,
    starter: 0,
    pro: 0,
    enterprise: 0,
  };

  const formattedSubscriptions = subscriptions.map((sub) => {
    const planKey = (sub.planId || "free").toLowerCase();
    const price = planPrices[planKey] || 0;

    if (sub.status === "ACTIVE") {
      mrr += price;
      activeCount++;
    } else if (sub.status === "TRIALING") {
      trialingCount++;
    } else if (sub.status === "PAUSED") {
      pausedCount++;
    } else if (sub.status === "CANCELED") {
      canceledCount++;
    } else if (sub.status === "PAST_DUE") {
      pastDueCount++;
    }

    if (planDistribution[planKey] !== undefined) {
      planDistribution[planKey]++;
    } else {
      planDistribution[planKey] = 1;
    }

    return {
      id: sub.id,
      organizationId: sub.organizationId,
      organizationName: sub.organization.name,
      owner: sub.organization.owner,
      planId: planKey,
      status: sub.status,
      price,
      startDate: sub.startDate,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      stripeCustomerId: sub.stripeCustomerId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      memberCount: sub.organization._count.members,
      workspaceCount: sub.organization._count.businesses,
      usage: sub.usage,
    };
  });

  // Include organizations that haven't initialized subscriptions yet as Free
  organizations.forEach((org) => {
    planDistribution.free++;
  });

  return {
    metrics: {
      mrr,
      arr: mrr * 12,
      totalSubscriptions: subscriptions.length + organizations.length,
      activeSubscriptions: activeCount,
      trialingSubscriptions: trialingCount,
      pausedSubscriptions: pausedCount,
      canceledSubscriptions: canceledCount,
      pastDueSubscriptions: pastDueCount,
      planDistribution,
    },
    subscriptions: formattedSubscriptions,
    webhooks: webhooks.map((w) => ({
      id: w.id,
      provider: w.provider,
      eventId: w.eventId,
      eventType: w.eventType,
      processed: w.processed,
      error: w.error,
      retryCount: w.retryCount,
      createdAt: w.createdAt,
    })),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      userId: log.userId,
      details: log.details,
      status: log.status,
      createdAt: log.createdAt,
    })),
  };
}

export async function adminUpdateSubscription(
  subscriptionId: string,
  data: {
    planId: string;
    status: "ACTIVE" | "PAUSED" | "CANCELED" | "PAST_DUE" | "TRIALING";
    extendDays?: number;
    reason?: string;
  }
) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const targetPlan = data.planId.toLowerCase() as PlanId;
  const planConfig = PLANS[targetPlan] || PLANS.free;

  const existingSub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      organization: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!existingSub) throw new Error("Subscription not found");

  const now = new Date();
  let periodEnd = new Date(existingSub.currentPeriodEnd);

  if (data.extendDays && data.extendDays > 0) {
    periodEnd = new Date(periodEnd.getTime() + data.extendDays * 24 * 60 * 60 * 1000);
  } else if (periodEnd < now) {
    periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId: targetPlan.toUpperCase(),
      status: data.status,
      currentPeriodEnd: periodEnd,
    },
  });

  // Sync usage limits
  const featuresToSync = [
    { feature: "AI_POSTS" as const, limit: planConfig.features.ai_posts },
    { feature: "AI_BLOG_ARTICLES" as const, limit: planConfig.features.ai_articles },
    { feature: "TEAM_MEMBERS" as const, limit: planConfig.features.team_collaboration ? 10 : 1 },
  ];

  for (const item of featuresToSync) {
    await prisma.subscriptionUsage.upsert({
      where: {
        subscriptionId_feature_period: {
          subscriptionId,
          feature: item.feature,
          period: "MONTHLY",
        },
      },
      create: {
        subscriptionId,
        feature: item.feature,
        used: 0,
        limit: item.limit,
        period: "MONTHLY",
        resetDate: periodEnd,
      },
      update: {
        limit: item.limit,
        resetDate: periodEnd,
      },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_OVERRIDE_SUBSCRIPTION",
      resource: `Subscription:${subscriptionId}`,
      userId: existingSub.organization.ownerId,
      status: "SUCCESS",
      details: {
        adminId: session.id,
        adminEmail: session.email,
        organizationId: existingSub.organizationId,
        organizationName: existingSub.organization.name,
        previousPlan: existingSub.planId.toLowerCase(),
        previousStatus: existingSub.status,
        newPlan: targetPlan,
        newStatus: data.status,
        extendDays: data.extendDays || 0,
        reason: data.reason || "Manual override via Admin Billing Control",
        timestamp: now.toISOString(),
      },
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/settings/billing");

  return { success: true };
}

export async function adminResetUsage(subscriptionId: string, feature?: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { organization: true },
  });

  if (!sub) throw new Error("Subscription not found");

  if (feature) {
    await prisma.subscriptionUsage.updateMany({
      where: {
        subscriptionId,
        feature: feature as any,
      },
      data: {
        used: 0,
      },
    });
  } else {
    await prisma.subscriptionUsage.updateMany({
      where: {
        subscriptionId,
      },
      data: {
        used: 0,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "ADMIN_RESET_USAGE",
      resource: `Subscription:${subscriptionId}`,
      userId: sub.organization.ownerId,
      status: "SUCCESS",
      details: {
        adminId: session.id,
        adminEmail: session.email,
        feature: feature || "ALL_FEATURES",
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminRetryWebhook(webhookId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.webhookEvent.update({
    where: { id: webhookId },
    data: {
      processed: true,
      error: null,
      processedAt: new Date(),
      retryCount: { increment: 1 },
    },
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

