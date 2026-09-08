import 'dotenv/config';
import fs from 'fs';
import '@/features/scheduler/workers/posting.worker'; // Import to start the post worker
import '@/features/workflow/workers/workflow-execution.worker';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import { ContentGenerationWorker } from '@/features/scheduler/workers/content-generation.worker';
import { emailWorker } from '@/features/scheduler/workers/emailWorker'; // Import and start the email worker
import { VideoStatusWorker } from '@/features/video_generation/workers/video-status.worker';
import { ImageGenerationWorker } from '@/features/image_generation/workers/image-generation.worker';
// import { ImageStatusWorker } from '@/features/image_generation/workers/image-status.worker';
import { collectSystemMetrics } from './SystemLogs/system-metrics-cron';
import { ImageStorageService } from '@/services/image-storage.service';
import { AutopilotWorker } from '@/features/generation/workers/autopilot.worker';
import socialWorker from '@/features/scheduler/workers/social.worker';
import { SystemLogger } from '@/features/system/services/logger.service';
import { AdGenerationWorker } from '@/features/ad-campaigns/workers/ad-generation.worker';
import { CampaignLaunchWorker } from '@/features/ad-campaigns/workers/campaign-launch.worker';
import { AdPerformanceSyncWorker } from '@/features/ad-campaigns/workers/ad-performance-sync.worker';
import { CredentialHealthWorker } from '@/features/ad-campaigns/workers/credential-health.worker';



async function main() {
  console.log('🚀 Starting AI Social Media Automation Platform Services...');

  try {
    await SystemLogger.logCron("SERVICE_STARTUP", "START");

    // Start workers
    console.log('📝 Starting Content Generation Worker...');
    const contentWorker = new ContentGenerationWorker();

    console.log('🎬 Starting Video Status Worker...');
    const videoWorker = new VideoStatusWorker();

    console.log('🎨 Starting Image Generation Worker...');
    const imageWorker = new ImageGenerationWorker();

    // console.log('🖼️ Starting Image Status Worker...');
    // const imageStatusWorker = new ImageStatusWorker();

    console.log('📤 Starting Posting Worker...');
    // Posting worker is started by importing the module

    console.log('⚙️ Starting Workflow Execution Worker...');
    // Workflow execution worker is started by importing the module

    console.log('🤖 Starting Autopilot Generation Worker...');
    const autopilotWorker = new AutopilotWorker();

    console.log('📢 Starting Ad Campaign Workers...');
    const adGenWorker = new AdGenerationWorker();
    const campaignLaunchWorker = new CampaignLaunchWorker();
    const adSyncWorker = new AdPerformanceSyncWorker();
    const credentialHealthWorker = new CredentialHealthWorker();

    console.log('📧 Starting Email Worker...');
    // emailWorker is started by importing the module above

    console.log('📱 Starting Social Worker...');
    // socialWorker is started by importing the module above

    // Add pending video jobs to queue
    console.log('📋 Adding pending video jobs to queue...');
    await videoWorker.addPendingJobsToQueue();

    // Add pending image jobs to queue
    console.log('🖼️ Adding pending image jobs to queue...');
    await imageWorker.addPendingJobsToQueue();
    // await imageStatusWorker.addPendingJobsToQueue();

    console.log('⏰ Starting Scheduler Service...');

    // Process scheduled posts every minute
    setInterval(async () => {
      const tickStart = Date.now();
      try {
        await SystemLogger.logCron("SCHEDULER_TICK", "START");
        await SchedulerService.processScheduledPosts();
        await SystemLogger.logCron("SCHEDULER_TICK", "SUCCESS", { duration: Date.now() - tickStart });
      } catch (err: any) {
        await SystemLogger.logCron("SCHEDULER_TICK", "FAILURE", { duration: Date.now() - tickStart, error: err.message });
      }
    }, 60000); // 1 minute

    // Periodically retry failed image uploads to S3
    setInterval(async () => {
      try {
        await ImageStorageService.retryFailedUploads();
      } catch (err) {
        console.error('Failed to retry uploads:', err);
      }
    }, 300000); // 5 minutes

    // Periodically clean up expired binary data from the DB fallback
    setInterval(async () => {
      try {
        await ImageStorageService.cleanupExpiredBinaries();
      } catch (err) {
        console.error('Failed to cleanup binaries:', err);
      }
    }, 3600000); // 1 hour

    // Collect system metrics every 5 minutes
    setInterval(async () => {
      try {
        await collectSystemMetrics();
      } catch (err) {
        console.error('Failed to collect metrics:', err);
      }
    }, 300000); // 5 minutes

    // Periodically touch heartbeat file for Docker and K8s health checks
    const heartbeatPath = process.env.HEARTBEAT_FILE || '/tmp/worker-heartbeat';
    const touchHeartbeat = () => {
      try {
        fs.writeFileSync(heartbeatPath, new Date().toISOString(), 'utf-8');
      } catch (err) {
        // Fallback silently if /tmp is restricted
      }
    };
    touchHeartbeat();
    const heartbeatInterval = setInterval(touchHeartbeat, 15000);

    // Graceful shutdown — closes all workers cleanly
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      await SystemLogger.logCron("SERVICE_SHUTDOWN", "START", { message: `Shutdown signal: ${signal}` });

      clearInterval(heartbeatInterval);
      try {
        if (fs.existsSync(heartbeatPath)) fs.unlinkSync(heartbeatPath);
      } catch {}

      await contentWorker.close();
      // await videoWorker.close();
      await imageWorker.close();
      // await imageStatusWorker.close();
      await autopilotWorker.close();
      await adGenWorker.close();
      await campaignLaunchWorker.close();
      await adSyncWorker.close();
      await credentialHealthWorker.close();
      await emailWorker.close();
      await socialWorker.close();
      // Posting worker will be closed by its own signal handler
      await SchedulerService.closeAll();

      await SystemLogger.logCron("SERVICE_SHUTDOWN", "SUCCESS");
      console.log('✅ All services stopped successfully');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    await SystemLogger.logCron("SERVICE_STARTUP", "SUCCESS");
    console.log('✅ All services started successfully');
    console.log('📊 Queue Status:', await SchedulerService.getQueueStats());

  } catch (error: any) {
    await SystemLogger.logCron("SERVICE_STARTUP", "FAILURE", { error: error.message });
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
