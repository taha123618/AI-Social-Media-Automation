import prisma from '../lib/prisma';

async function main() {
  const email = 'taha.anees@devteampro.us';
  const deleted = await prisma.user.deleteMany({
    where: { email },
  });
  console.log(`Cleaned up ${deleted.count} user record(s) for ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
