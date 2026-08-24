import { PrismaClient } from './app/generated/prisma/client';
const prisma = new PrismaClient({} as any);

async function main() {
  const tokens = await prisma.verification.findMany({
    where: { identifier: 'tahaahmedanees2@gmail.com' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(tokens, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
