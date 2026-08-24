import { PrismaClient } from './app/generated/prisma/client';
const prisma = new PrismaClient({} as any);

async function main() {
  await prisma.user.deleteMany({
    where: { email: 'tahaahmedanees2@gmail.com' }
  });
  console.log('Deleted user tahaahmedanees2@gmail.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
