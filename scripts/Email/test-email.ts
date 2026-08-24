import { sendRegistrationEmail } from '../../lib/email-service';
import { emailQueue } from '../../lib/emailQueue';
import redis from '../../lib/redis';

/**
 * A simple standalone script to manually test that the email queue and worker
 * are functioning correctly without needing to register a whole new user.
 *
 * Run this with: npx tsx scripts/Email/test-email.ts <your-email>
 */

async function main() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ Error: Please provide an email address to send the test to.');
    console.log('Usage: npx tsx scripts/test-email.ts your.name@example.com');
    process.exit(1);
  }

  console.log(`🚀 Queueing test email for ${targetEmail}...`);

  try {
    // Call the actual registration email service to test the real template
    await sendRegistrationEmail(targetEmail, "Test User");

    console.log(`✅ Success! Registration email added to the queue.`);
    console.log('👀 Check your other terminal running `npm run workers` to see it process.');
    console.log('Once completed, check the inbox of:', targetEmail);

  } catch (error) {
    console.error('❌ Failed to queue the test email:', error);
  } finally {
    // Cleanly exit back to the terminal prompt by closing our producer connections
    await emailQueue.close();
    await redis.quit();
    process.exit(0);
  }
}

main();
