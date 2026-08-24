import prisma from '@/lib/prisma';

async function main() {
  const accounts = await prisma.socialAccount.findMany({
    select: {
      id: true,
      businessId: true,
      platform: true,
      platformId: true,
      name: true,
      isActive: true,
    }
  });
  console.log('Social Accounts in database:');
  console.table(accounts);
  
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
    }
  });
  console.log('Businesses in database:');
  console.table(businesses);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
