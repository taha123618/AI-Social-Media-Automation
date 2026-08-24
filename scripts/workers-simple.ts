import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import { ContentGenerationWorker } from '../features/scheduler/workers/content-generation.worker';
import { VideoStatusWorker } from '@/features/video_generation/workers/video-status.worker';
import { ImageGenerationWorker } from '@/features/image_generation/workers/image-generation.worker';
import { ImageStatusWorker } from '@/features/image_generation/workers/image-status.worker';
import '../features/scheduler/workers/posting.worker'; // Import to start the post worker
import '../features/workflow/workers/workflow-execution.worker'; // Import to start the workflow worker

async function main() {
  console.log('🚀 Starting AI Social Media Automation Platform Services...');

  try {
    // Start workers
    console.log('📝 Starting Content Generation Worker...');
    const contentWorker = new ContentGenerationWorker();

    console.log('🎬 Starting Video Status Worker...');
    const videoWorker = new VideoStatusWorker();

    console.log('🎨 Starting Image Generation Worker...');
    const imageWorker = new ImageGenerationWorker();

    console.log('🖼️ Starting Image Status Worker...');
    const imageStatusWorker = new ImageStatusWorker();

    console.log('📤 Starting Posting Worker... (Initialized via import)');

    console.log('⚙️ Starting Workflow Execution Worker... (Initialized via import)');

    // Add pending video jobs to queue
    console.log('📋 Adding pending video jobs to queue...');
    await videoWorker.addPendingJobsToQueue();

    // Add pending image jobs to queue
    console.log('🎨 Adding pending image jobs to queue...');
    await imageWorker.addPendingJobsToQueue();
    await imageStatusWorker.addPendingJobsToQueue();

    // Start scheduler service (processes scheduled posts)
    console.log('⏰ Starting Scheduler Service...');

    // Process scheduled posts every minute
    setInterval(async () => {
      await SchedulerService.processScheduledPosts();
    }, 60000); // 1 minute

    // Periodically check for new pending video jobs
    setInterval(async () => {
      await videoWorker.addPendingJobsToQueue();
    }, 60000); // 1 minute

    // Periodically check for new pending image jobs
    setInterval(async () => {
      await imageWorker.addPendingJobsToQueue();
      await imageStatusWorker.addPendingJobsToQueue();
    }, 60000); // 1 minute

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

      await contentWorker.close();
      await videoWorker.close();
      await imageWorker.close();
      await imageStatusWorker.close();
      // Posting worker will be closed by its own signal handler
      await SchedulerService.closeAll();

      console.log('✅ All services stopped successfully');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    console.log('✅ All services started successfully');
    console.log('📊 Queue Status:', await SchedulerService.getQueueStats());

  } catch (error) {
    console.error('❌ Failed to start services:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
