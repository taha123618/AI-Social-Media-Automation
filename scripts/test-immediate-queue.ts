import { VideoService } from '../features/video_generation/services/video.service';
import { QueueManager, QUEUE_NAMES } from '../features/scheduler/config/queue.config';
import 'dotenv/config';

async function testImmediateQueueing() {
  const videoStatusQueue = QueueManager.getQueue(QUEUE_NAMES.VIDEO_STATUS);
  console.log('🧪 Testing Immediate Video Queueing...');

  // Mock Request
  const request = {
    businessId: 'test-biz-' + Date.now(),
    visualPrompt: 'A simple test video of a bouncing ball',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'standard' as const,
    model: 'gen4.5' as const,
    contentType: 'text_to_reel' as const
  };

  try {
    // We expect this to call addVideoStatusJob internally
    // Note: VideoService might use mock if API key is missing, let's check it
    const result = await VideoService.generateWithRunway(request);
    console.log('Generation Result:', result);

    // Check queue stats
    const stats = await videoStatusQueue.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed');
    console.log('Queue Stats after generation:', stats);

    if (stats.delayed > 0 || stats.waiting > 0 || stats.active > 0) {
      console.log('✅ PASS: Job was successfully added to the queue.');
    } else {
      console.log('❌ FAIL: No jobs found in the queue.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await videoStatusQueue.close();
    process.exit(0);
  }
}

testImmediateQueueing();
