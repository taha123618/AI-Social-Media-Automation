import {
  CreateContentWithScheduleSchema,
  SaveDraftSchema,
  PublishPostNowSchema,
} from '../post-creation.schema';
import { Platform, ContentIntent } from '@/app/generated/prisma/enums';

describe('PostCreationSchema Validation', () => {
  describe('CreateContentWithScheduleSchema', () => {
    it('validates a complete post creation payload successfully', () => {
      const validPayload = {
        content: 'Check out our new weekly product release!',
        firstComment: 'Link in bio for 20% discount',
        platforms: [Platform.TWITTER, Platform.LINKEDIN],
        accountIds: ['acc_tw_1', 'acc_li_1'],
        intent: ContentIntent.SALES,
        isImmediate: true,
        mediaUrls: ['https://s3.amazonaws.com/media/poster.png'],
        labels: ['launch', 'promo'],
      };

      const parsed = CreateContentWithScheduleSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('rejects empty content payload', () => {
      const invalidPayload = {
        content: '',
        platforms: [Platform.TWITTER],
        accountIds: ['acc_tw_1'],
        intent: ContentIntent.EDUCATION,
      };

      const parsed = CreateContentWithScheduleSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });

    it('rejects payload with no platforms selected', () => {
      const invalidPayload = {
        content: 'Some post',
        platforms: [],
        accountIds: ['acc_tw_1'],
        intent: ContentIntent.ENGAGEMENT,
      };

      const parsed = CreateContentWithScheduleSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe('PublishPostNowSchema', () => {
    it('requires contentId for immediate publishing dispatch', () => {
      const valid = PublishPostNowSchema.safeParse({ contentId: 'draft_123' });
      expect(valid.success).toBe(true);

      const invalid = PublishPostNowSchema.safeParse({});
      expect(invalid.success).toBe(false);
    });
  });
});
