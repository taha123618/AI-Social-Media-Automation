import 'dotenv/config';
import { SchedulerService } from '../features/scheduler/services/scheduler.service';
import prisma from '../lib/prisma';

async function verifyQueues() {
   console.log('🧪 Verifying Content and Knowledge Queues...');

   try {
      const business = await prisma.business.findFirst({
         include: { members: true }
      });

      if (!business) {
         console.error('❌ Error: No business found in database.');
         process.exit(1);
      }

      const creatorId = business.members[0]?.userId;
      if (!creatorId) {
         console.error('❌ Error: No member found for business.');
         process.exit(1);
      }

      console.log(`Using Business: ${business.name} (${business.id})`);
      console.log(`Using Creator: ${creatorId}`);

      // 1. Test Content Generation Queue (Simulating API Flow)
      console.log('\n--- Testing Content Generation Queue (Simulating API Flow) ---');
      const draft = await prisma.contentDraft.create({
         data: {
            businessId: business.id,
            creatorId,
            intent: 'SALES' as any,
            platforms: ['LINKEDIN' as any],
            status: 'DRAFT' as any,
            assetStatus: 'GENERATING' as any,
            title: 'Verified Async Post'
         }
      });
      console.log('✅ Placeholder Draft created. ID:', draft.id);

      const genJob = await SchedulerService.queueGenerationTask({
         businessId: business.id,
         creatorId,
         intent: 'SALES' as any,
         platforms: ['LINKEDIN' as any],
         topic: 'The future of AI in social media',
         draftId: draft.id
      });
      console.log('✅ Content Generation job enqueued with draftId. Job ID:', genJob.id);

      // 2. Test Knowledge Processing Queue
      console.log('\n--- Testing Knowledge Processing Queue ---');

      let kb = await prisma.knowledgeBase.findUnique({ where: { businessId: business.id } });
      if (!kb) kb = await prisma.knowledgeBase.create({ data: { businessId: business.id } });

      // Find or create a dummy document
      let doc = await prisma.knowledgeDocument.findFirst({
         where: { knowledgeBaseId: kb.id }
      });

      if (!doc) {
         console.log('No document found, creating a test document reference...');
         doc = await prisma.knowledgeDocument.create({
            data: {
               knowledgeBaseId: kb.id,
               filename: 'test-doc.txt',
               fileType: 'text/plain',
               s3Key: 'test/test-doc.txt',
               sourceUrl: 'https://example.com/test-doc.txt',
               status: 'PROCESSING'
            }
         });
      }

      const knJob = await SchedulerService.queueKnowledgeTask({
         businessId: business.id,
         documentId: doc.id,
         content: 'This is test content for knowledge processing via BullMQ.'
      });
      console.log('✅ Knowledge Processing job enqueued. ID:', knJob.id);

      console.log('\n--- Summary ---');
      console.log('Both tasks successfully enqueued to BullMQ.');
      console.log('To process these jobs, run:');
      console.log('  npm run worker:generation');
      console.log('  npm run worker:knowledge');

   } catch (error) {
      console.error('❌ Verification failed:', error);
   } finally {
      await SchedulerService.closeAll();
      const p = prisma as any;
      if (p.$disconnect) await p.$disconnect();
      process.exit(0);
   }
}

verifyQueues();
