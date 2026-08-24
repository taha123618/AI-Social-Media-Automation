"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAdminToken, setAdminSession, removeAdminSession, getAdminSession } from "@/lib/admin-auth";
import { sendAdminInvitationEmail } from "@/lib/email-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
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

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true,
          workflows: true,
        }
      }
    }
  });
}

export async function createUser(data: z.infer<typeof userSchema>) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Unauthorized");

  const validatedData = userSchema.parse(data);
  const hashedPassword = validatedData.password
    ? await bcrypt.hash(validatedData.password, 12)
    : undefined;

  await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      accounts: hashedPassword ? {
        create: {
          type: "credentials",
          password: hashedPassword,
          providerId: "credentials",
          accountId: validatedData.email,
        }
      } : undefined
    }
  });

  revalidatePath("/admin/users");
  return { success: true };
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
