import "dotenv/config";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";



async function main() {
  const email = "admin@gmail.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "super_admin",
    },
    create: {
      email,
      name: "Super Admin",
      password: hashedPassword,
      role: "super_admin",
    },
  });

  console.log(`✅ Super admin created/updated: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
