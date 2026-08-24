import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pgvector from 'pgvector';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleanup...");
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  console.log("Seeding...");

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gmail.com",
    },
  });

  // 2. Create Business & KnowledgeBase
  const business = await prisma.business.create({
    data: {
      name: "AI Agency",
      slug: "ai-agency",
      members: {
        create: { userId: user.id, role: "OWNER" }
      },
      knowledgeBase: {
        create: {} // KnowledgeBase is @unique to business
      }
    },
    include: { knowledgeBase: true }
  });

  // 3. Create a Document
  const doc = await prisma.knowledgeDocument.create({
    data: {
      knowledgeBaseId: business.knowledgeBase!.id,
      filename: "handbook.pdf",
      fileType: "PDF",
    }
  });

  // 4. INSERT VECTOR (Raw SQL Required for Unsupported Type)
  const dummyVector = new Array(1536).fill(0).map(() => Math.random());
  const vectorSql = pgvector.toSql(dummyVector);

  await prisma.$executeRaw`
    INSERT INTO "KnowledgeChunk" ("id", "content", "embedding", "documentId", "knowledgeBaseId")
    VALUES (
      ${'chunk_1'},
      ${'This is seeded content for vector search.'},
      ${vectorSql}::vector,
      ${doc.id},
      ${business.knowledgeBase!.id}
    )
  `;

  console.log("Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
