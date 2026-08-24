import prisma from "@/lib/prisma";



async function main() {
  const id = 'cmnx95tbh0005rvcm26zcuh6l';
  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            socialAccount: true
          }
        }
      }
    });
    console.log('--- DRAFT DATA ---');
    console.log(JSON.stringify(draft, null, 2));
    console.log('--- END ---');
  } catch (err) {
    console.error('Prisma Error:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
