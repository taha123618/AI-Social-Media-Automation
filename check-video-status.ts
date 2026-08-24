import { VideoService } from './features/video_generation/services/video.service';

async function checkVideoStatus() {
  const jobId = 'c0d47a75-115c-42fb-8cc0-dc768d0846f3';

  try {
    console.log(`🔍 Checking status for job: ${jobId}`);
    const status = await VideoService.checkStatus(jobId);
    console.log('✅ Job Status:', JSON.stringify(status, null, 2));
  } catch (error: any) {
    console.error('❌ Error checking status:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkVideoStatus();
