# Meta Business Manager - Complete API Permissions & Scopes Guide

## Overview

This document contains all required permissions, scopes, API endpoints, and configuration needed to enable full functionality for Facebook, Instagram Business, and Creator Accounts.

---

## 1. OAuth 2.0 Scopes

### All Required Scopes

```
public_profile
pages_show_list
pages_read_engagement
pages_manage_posts
pages_read_insights
pages_manage_metadata
instagram_basic
instagram_content_publish
instagram_graph_api
business_management
```

### Scope Breakdown

#### User Profile Access
- **`public_profile`** - Read user's public profile info
- **`email`** (optional) - Access user's email address

#### Facebook Pages
- **`pages_show_list`** - List all Pages the user owns or manages
- **`pages_read_engagement`** - Read engagement metrics (likes, comments, shares)
- **`pages_manage_posts`** - Create, edit, delete posts on Pages
- **`pages_read_insights`** - Access detailed Page insights and analytics
- **`pages_manage_metadata`** - Manage Page settings and metadata
- **`pages_read_user_content`** - Read user content on Pages (optional)

#### Instagram Business
- **`instagram_basic`** - Read basic Instagram Account info
- **`instagram_content_publish`** - Publish content (photos, videos, reels)
- **`instagram_graph_api`** - Full Instagram Graph API access
- **`instagram_manage_insights`** - Read Instagram insights (clicks, reach, impressions)

#### Creator Accounts (Instagram)
- Same scopes as Instagram Business (slightly different endpoint)

#### Business Manager
- **`business_management`** - Manage Business Manager assets
- **`catalog_management`** (optional) - Manage product catalogs

---

## 2. Access Token Types & Lifetimes

### User Access Token
- **Lifetime**: 60 days (short-lived converted to long-lived)
- **Scope**: User-specific permissions
- **Used for**: OAuth login, initial authentication
- **Refresh**: Can be converted to long-lived token

```bash
# Initial token (expires in ~1 hour)
https://graph.facebook.com/oauth/access_token?
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  code=AUTHORIZATION_CODE&
  redirect_uri=YOUR_REDIRECT_URI

# Convert to long-lived (expires in ~60 days)
https://graph.facebook.com/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  fb_exchange_token=SHORT_LIVED_TOKEN
```

### Page Access Token
- **Lifetime**: Infinite (unless Page password is changed)
- **Scope**: Page-specific actions
- **Used for**: Publishing to Pages, reading Page insights

```bash
GET https://graph.facebook.com/v19.0/me/accounts?access_token=USER_ACCESS_TOKEN
# Returns list of Pages with their access_tokens
```

### Business Access Token
- **Lifetime**: Variable
- **Scope**: Business Manager assets
- **Used for**: Managing multiple Pages/Accounts

---

## 3. Facebook Graph API Endpoints

### Base URL
```
https://graph.facebook.com/v19.0
```

### Publishing Endpoints

#### Create Feed Post (Facebook Page)
```bash
POST /PAGE_ID/feed
Parameters:
  - message: String (post content)
  - picture: String (image URL)
  - link: String (external link)
  - description: String (description)
  - published: Boolean (true = immediate, false = draft)
  - scheduled_publish_time: Unix timestamp (for scheduling)

Response:
  {
    "id": "PAGE_ID_POST_ID",
    "post_id": "POST_ID"
  }
```

#### Create Feed Post with Media
```bash
POST /PAGE_ID/feed
Parameters:
  - message: String
  - attached_media: Array<Object> (Requires special format)
  - multi_share_end_card: Boolean (true)

Format:
  attached_media: [
    { media: { image: { src: "URL" } } },
    { media: { image: { src: "URL" } } }
  ]
```

#### Create Reel/Video (Instagram Business)
```bash
POST /IG_BUSINESS_ACCOUNT_ID/media
Parameters:
  - media_type: 'REELS_VIDEO' | 'VIDEO'
  - video_url: String (or image_url for photos)
  - caption: String
  - thumb_offset: Integer (for video thumbnail)

Returns:
  { "id": "CREATION_ID" }

# Then publish:
POST /IG_BUSINESS_ACCOUNT_ID/media_publish
Parameters:
  - creation_id: String (from previous response)
```

#### Create Story (Instagram)
```bash
POST /IG_BUSINESS_ACCOUNT_ID/media
Parameters:
  - media_type: 'STORIES'
  - image_url: String
  - caption: String

POST /IG_BUSINESS_ACCOUNT_ID/media_publish
```

### Insights/Analytics Endpoints

#### Facebook Page Insights
```bash
GET /PAGE_ID/insights
Fields:
  - page_impressions (daily, weekly, monthly)
  - page_post_engagements
  - page_views_total
  - page_fan_adds
  - page_consumptions

Parameters:
  - metric: String (comma-separated metrics)
  - since: Unix timestamp
  - until: Unix timestamp
  - period: 'day' | 'week' | 'month' | 'lifetime'
```

#### Facebook Post Insights
```bash
GET /POST_ID/insights
Metrics:
  - post_impressions
  - post_clicks
  - post_reactions_total (TOTAL)
  - post_reactions_like
  - post_reactions_love
  - post_reactions_wow
  - post_reactions_haha
  - post_reactions_sad
  - post_reactions_angry
  - post_shares
  - post_engaged_users
  - post_video_avg_time_watched
  - post_video_complete_views
  - post_video_views
```

#### Instagram Media Insights
```bash
GET /IG_MEDIA_ID/insights
Metrics:
  - engagement (likes + comments + shares)
  - impressions
  - reach
  - saved
  - video_views (for video/reels)
  - video_avg_time_watched
  - shares
  - taps_forward
  - taps_back
  - exits
  - plays
  - total_interactions

Parameters:
  - metric: String (comma-separated)
```

#### Instagram Account Insights
```bash
GET /IG_ACCOUNT_ID/insights
Metrics:
  - impressions
  - reach
  - profile_views
  - follower_count
  - website_clicks
  - email_contacts
  - phone_call_clicks
  - text_message_clicks
  - get_directions_clicks
```

### Deletion Endpoints

#### Delete Post
```bash
DELETE /POST_ID?access_token=PAGE_ACCESS_TOKEN

Returns:
  { "success": true }
```

#### Delete Media (Instagram)
```bash
DELETE /IG_MEDIA_ID?access_token=ACCESS_TOKEN

Returns:
  { "success": true }
```

---

## 4. Environment Variables Required

```bash
# .env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
META_WEBHOOK_TOKEN=your_webhook_token
META_WEBHOOK_URL=https://yourdomain.com/webhooks/meta
OPENAI_API_KEY=your_openai_key
```

---

## 5. Application Setup (Meta Developer Console)

### Create App
1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" app type
4. Fill in details:
   - App Type: Business
   - App Name: "Social Media Automation"
   - App Purpose: "Content Publishing & Analytics"

### Add Products
1. Dashboard → "Add Product"
2. Add these products:
   - **Facebook Login** - For OAuth
   - **Facebook Graph API** - For publishing & insights
   - **Instagram Graph API** - For Instagram business accounts

### Configure OAuth
1. Settings → Basic → Copy App ID & Secret
2. Settings → OAuth Redirect URIs:
   ```
   https://yourdomain.com/api/social/auth/callback
   https://yourdomain.com/api/oauth/callback
   ```

### Configure Webhooks
1. Messenger → Webhooks → Subscribe to Webhooks
2. Callback URL: `https://yourdomain.com/webhooks/meta`
3. Verify Token: Generate secure random string
4. Subscribe Fields:
   ```
   feed
   comments
   likes
   mentions
   message_echoes
   messaging_postbacks
   ```

### Request Permissions
1. App Roles → Edit App Roles
2. Invite test users
3. Add test pages and Instagram accounts
4. For production:
   - Submit for App Review
   - Request required permissions
   - Wait for approval

---

## 6. Token Refresh Strategy

### Short-Lived Token Conversion
```typescript
async function convertToLongLivedToken(shortLivedToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        fb_exchange_token: shortLivedToken,
      }),
    }
  );
  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in, // ~5183944 seconds (60 days)
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
```

### Token Expiration Check
```typescript
async function refreshTokenIfNeeded(socialAccount: SocialAccount) {
  if (!socialAccount.tokenExpiresAt) return socialAccount.accessToken!;

  const now = new Date();
  const expiresAt = new Date(socialAccount.tokenExpiresAt);

  // Refresh if expires in < 1 day
  if (expiresAt.getTime() - now.getTime() < 86400000) {
    return await convertToLongLivedToken(socialAccount.refreshToken!);
  }

  return socialAccount.accessToken!;
}
```

---

## 7. Rate Limits

### Facebook Graph API Rate Limits
- **User Rate Limit**: 200 calls per hour per user
- **Page Rate Limit**: 1000 calls per hour
- **App Rate Limit**: Shared across all app instances

### Headers to Monitor
```
X-Rate-Limit-Usage: 100/200
X-Rate-Limit-Remaining: 99
X-Rate-Limit-Reset: 1234567890 (unix timestamp)
```

### Handling Rate Limits
```typescript
if (response.status === 429) {
  const resetTime = parseInt(response.headers.get('x-rate-limit-reset') || '0') * 1000;
  const waitTime = Math.max(resetTime - Date.now(), 60000);
  await new Promise(resolve => setTimeout(resolve, waitTime));
  // Retry request
}
```

---

## 8. Webhook Events

### Webhook Verification Challenge
```bash
GET /webhooks/meta
  ?hub.mode=subscribe
  &hub.challenge=CHALLENGE_STRING
  &hub.verify_token=YOUR_VERIFY_TOKEN

# Response:
echo $_REQUEST["hub_challenge"]; // Return challenge string
```

### Webhook Event Types

#### Feed Events (Posts)
```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1234567890,
      "messaging": [
        {
          "id": "MESSAGE_ID",
          "time": 1234567890,
          "message": {
            "mid": "MID",
            "text": "post_text"
          }
        }
      ]
    }
  ]
}
```

#### Comment Events
```json
{
  "object": "page",
  "entry": [
    {
      "changes": [
        {
          "field": "feed",
          "value": {
            "item": "comment",
            "comment_id": "COMMENT_ID",
            "post_id": "POST_ID",
            "verb": "add|remove|edit",
            "message": "comment text",
            "from": {
              "id": "USER_ID",
              "name": "User Name"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 9. Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 100 | Invalid parameter | Check field names and values |
| 104 | Invalid access token | Refresh or re-authenticate |
| 190 | Invalid OAuth token | User needs to re-authorize |
| 200 | Permissions error | Request additional scopes |
| 368 | Temporary rate limit | Wait and retry |
| 613 | Calls/minute limit | Implement backoff strategy |

### Error Response Format
```json
{
  "error": {
    "message": "Invalid OAuth access token",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 0
  }
}
```

---

## 10. Best Practices

### Security
- ✅ Store tokens in encrypted database
- ✅ Use environment variables for secrets
- ✅ Validate webhook tokens
- ✅ Use HTTPS for all redirects
- ✅ Never log tokens
- ✅ Implement CSRF protection for OAuth flows

### Performance
- ✅ Batch multiple requests when possible
- ✅ Use caching for insights data
- ✅ Implement queue system for publishing
- ✅ Monitor rate limits
- ✅ Stagger scheduled posts

### Reliability
- ✅ Implement retry logic with exponential backoff
- ✅ Store post metadata before publishing
- ✅ Log all publishing attempts
- ✅ Set up monitoring/alerts
- ✅ Have fallback if one platform fails

---

## 11. Testing

### Test Setup
1. Create Facebook Test App
2. Create test user accounts
3. Create test Pages
4. Create test Instagram Business Accounts

### Test Endpoints
```bash
# Get test user
GET /APP_ID/accounts/test-users?access_token=APP_ACCESS_TOKEN

# Create test page
POST /APP_ID/accounts/test-accounts?
  access_token=APP_ACCESS_TOKEN&
  type=PAGE

# Create test Instagram account
POST /TEST_PAGE_ID/instagram_accounts?
  access_token=PAGE_ACCESS_TOKEN
```

---

## 12. Production Checklist

- [ ] All scopes requested and approved
- [ ] Webhook properly configured
- [ ] Rate limiting implemented
- [ ] Error handling for all API calls
- [ ] Token refresh strategy working
- [ ] Database encrypted for tokens
- [ ] Monitoring and alerts set up
- [ ] Logging implemented
- [ ] Tested with real Pages/Accounts
- [ ] Documentation updated
- [ ] App Review submitted (if required)
- [ ] Privacy Policy updated
- [ ] Terms of Service updated

---

## References

- [Meta for Developers](https://developers.facebook.com)
- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- [Webhooks Reference](https://developers.facebook.com/docs/graph-api/webhooks)
