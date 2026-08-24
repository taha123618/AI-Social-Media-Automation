# Social Media Posting Feature - Complete Implementation Guide

## Overview

This guide documents the complete implementation of a comprehensive social media posting feature similar to GravityWrite, supporting Instagram Business, Facebook Business, and Creator Accounts through Meta Business Manager integration.

## 🎯 Features Implemented

### ✅ Core Posting Workflow
- **Content Creation**: Enhanced post creation interface with rich text editing
- **Draft Management**: Auto-save functionality with real-time status indicators
- **Multi-Platform Support**: Facebook, Instagram, LinkedIn, Twitter, TikTok, YouTube
- **Media Management**: Image/video upload with preview capabilities
- **Scheduling**: Immediate posting or scheduled publishing
- **Post Types**: Support for Posts, Reels, and Stories (platform-dependent)

### ✅ Meta Business Manager Integration
- **Facebook Pages**: Full publishing and insights access
- **Instagram Business**: Content publishing and comprehensive analytics
- **Creator Accounts**: Specialized support for content creators
- **Unified Authentication**: Single OAuth flow for all Meta platforms

### ✅ Analytics & Insights
- **Real-time Metrics**: Likes, Comments, Shares, Saves, Reach, Impressions
- **Advanced Metrics**: Profile visits, Video views, Completion rates
- **Story Insights**: Limited-time-window analytics for stories
- **Engagement Rates**: Automatic calculation and tracking
- **Historical Data**: Long-term analytics storage and comparison

## 🏗️ Architecture

### Database Schema

```sql
-- Core Post Models
Post {
  id: String (PK)
  businessId: String
  creatorId: String
  draftId: String
  externalPostId: String?
  platform: Platform
  postedAt: DateTime
  publishedUrl: String?
  socialAccountId: String
  scheduledFor: DateTime?
  executionId: String?
  workflowId: String?
  analytics: PostAnalytics?
}

PostAnalytics {
  id: String (PK)
  likes: Int
  shares: Int
  comments: Int
  impressions: Int
  clicks: Int
  saves: Int
  videoViews: Int
  videoCompletionRate: Float?
  bookingClicks: Int
  directionRequests: Int
  messageClicks: Int
  phoneClicks: Int
  websiteClicks: Int
  postId: String (FK)
}

ContentDraft {
  id: String (PK)
  title: String?
  intent: ContentIntent
  platforms: Platform[]
  customPrompt: String?
  status: ContentStatus
  scheduledFor: DateTime?
  postedAt: DateTime?
  contentJson: Json?
  businessId: String
  creatorId: String
}
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  Enhanced Post Creation Component                           │
│  - Rich text editor with formatting                         │
│  - Media upload and preview                               │
│  - Platform-specific post types                            │
│  - Real-time preview                                      │
│  - AI content generation                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/posts/create                                │
│  POST /api/posts/draft                                 │
│  POST /api/posts/schedule                               │
│  GET  /api/posts/analytics                              │
│  POST /api/social/publish                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                Business Logic Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  Post Creation Service                                   │
│  - Content validation                                    │
│  - Media processing                                     │
│  - Scheduling logic                                     │
│                                                         │
│  Meta Business Manager Service                            │
│  - Facebook API integration                              │
│  - Instagram API integration                             │
│  - OAuth flow management                               │
│                                                         │
│  Analytics Service                                      │
│  - Metrics collection                                   │
│  - Engagement calculation                               │
│  - Historical analysis                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                External APIs                             │
├─────────────────────────────────────────────────────────────────┤
│  Meta Graph API v19.0                                 │
│  - Facebook Pages                                      │
│  - Instagram Business                                   │
│  - Creator Accounts                                     │
│                                                         │
│  Other Platform APIs                                    │
│  - LinkedIn, Twitter, TikTok, YouTube                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Required Permissions & Scopes

### Meta Business Manager Scopes

#### Basic Access
```javascript
const BASIC_SCOPES = [
  'public_profile',           // Read basic profile information
  'pages_show_list',         // List pages user manages
  'pages_read_engagement'     // Read page engagement data
];
```

#### Publishing Permissions
```javascript
const PUBLISHING_SCOPES = [
  'pages_manage_posts',       // Create and manage page posts
  'instagram_basic',          // Read Instagram basic info
  'instagram_content_publish'  // Publish to Instagram
];
```

#### Analytics Access
```javascript
const INSIGHTS_SCOPES = [
  'pages_read_insights',      // Read page insights
  'instagram_basic'           // Instagram insights (included in basic)
];
```

#### Business Management
```javascript
const BUSINESS_SCOPES = [
  'business_management',       // Manage business assets
  'pages_manage_metadata'     // Manage page settings
];
```

### Platform-Specific Permissions

#### Facebook Page Tasks
```javascript
const FACEBOOK_PERMISSIONS = {
  tasks: [
    'MANAGE_CONTENT',      // Create and edit content
    'MODERATE_CONTENT',    // Moderate user content
    'CREATE_CONTENT',       // Create new content
    'READ_INSIGHTS',       // Access page insights
    'PUBLISH_CONTENT'       // Publish content immediately
  ]
};
```

#### Instagram Business Tasks
```javascript
const INSTAGRAM_PERMISSIONS = {
  tasks: [
    'CONTENT_PUBLISH',     // Publish media and stories
    'ANALYZE',            // Access insights and analytics
    'MANAGE'              // Manage account settings
  ]
};
```

## 📊 Metrics & Insights Tracking

### Core Metrics
| Metric | Description | Source | Update Frequency |
|--------|-------------|---------|------------------|
| Likes | Total reactions/likes on post | Platform API | Real-time |
| Comments | Number of comments | Platform API | Real-time |
| Shares | Post share count | Platform API | Real-time |
| Saves | Post saves/bookmarks | Platform API | Real-time |
| Reach | Unique users who saw post | Platform API | Real-time |
| Impressions | Total post views | Platform API | Real-time |

### Advanced Metrics
| Metric | Description | Platform | Availability |
|--------|-------------|----------|--------------|
| Profile Visits | Clicks to profile from post | Facebook | ✅ |
| Video Views | Total video play count | Instagram/Facebook | ✅ |
| Completion Rate | Average video watch percentage | Instagram/Facebook | ✅ |
| Engagement Rate | (Likes + Comments + Shares + Saves) ÷ Reach | All | ✅ |

### Story Insights (Limited Time Window)
```javascript
const STORY_METRICS = {
  impressions: 'Total story views',
  reach: 'Unique viewers',
  replies: 'Story replies',
  taps_forward: 'Swipes to next story',
  taps_back: 'Swipes to previous story',
  // Note: Story insights are only available for 24 hours
  timeWindow: '24 hours from publication'
};
```

## 🚀 Implementation Details

### Enhanced Post Creation Component

**File**: `app/(user)/posts/create/_components/enhanced-post-creation.tsx`

**Key Features**:
- **Rich Text Editor**: Bold, italic formatting with character limits
- **Platform Selection**: Visual platform picker with account management
- **Post Type Support**: Facebook (Post/Reel/Story), Instagram (Post/Reel/Story)
- **Media Upload**: Drag-and-drop with preview and management
- **AI Generation**: Content generation with tone selection
- **Real-time Preview**: Platform-specific post previews
- **Auto-save**: Draft saving every 30 seconds
- **Activity Tracking**: Live engagement metrics display

### Meta Business Manager Service

**File**: `features/social/services/meta-business-manager.service.ts`

**Core Functions**:
```typescript
// Publishing
publishToFacebookPage(pageId, postData, accessToken)
publishToInstagram(instagramAccountId, postData, accessToken)

// Analytics
getPostInsights(postId, platform, accessToken)
getStoryInsights(storyId, accessToken)

// Account Management
getBusinessAccounts(accessToken)
validatePermissions(permissions, requiredScopes)
```

**Content Type Support**:
- **Facebook Posts**: Text, images, videos, carousels
- **Facebook Reels**: Short-form video content
- **Facebook Stories**: 24-hour ephemeral content
- **Instagram Posts**: Single images, carousels, videos
- **Instagram Reels**: Short-form vertical videos
- **Instagram Stories**: Ephemeral vertical content

### Analytics Service

**File**: `features/social/services/analytics.service.ts`

**Key Capabilities**:
```typescript
// Real-time Updates
updatePostAnalytics(postId, businessId)
batchUpdateAnalytics(postIds, businessId)

// Historical Analysis
getAnalyticsForTimeRange(businessId, timeRange)
getAnalyticsSummary(businessId, days)

// Export & Reporting
exportAnalytics(businessId, timeRange, format)
```

**Engagement Rate Calculation**:
```javascript
const engagementRate = (likes + comments + shares + saves) / reach * 100;
```

## 🔄 Posting Workflow

### 1. Content Creation
```
User selects platforms → Choose accounts → Write content → Add media → Set post type
```

### 2. Preview & Review
```
Real-time preview generation → Platform-specific formatting → Engagement prediction → Final review
```

### 3. Publishing Options
```
Post Now → Immediate API call → Status update → Analytics tracking
Schedule → Queue management → Timed publishing → Analytics tracking
```

### 4. Post-Publish Analytics
```
Automatic metrics fetch → Database update → Dashboard refresh → Historical tracking
```

## 🛠️ API Endpoints

### Post Management
```typescript
POST /api/posts/create          // Create new post
POST /api/posts/draft           // Save draft
POST /api/posts/schedule        // Schedule post
GET  /api/posts                 // List posts
GET  /api/posts/[id]            // Get post details
PUT  /api/posts/[id]            // Update post
DELETE /api/posts/[id]          // Delete post
```

### Analytics
```typescript
GET  /api/posts/analytics        // Get post analytics
POST /api/posts/analytics/update  // Update analytics
GET  /api/analytics/summary     // Get dashboard summary
GET  /api/analytics/export      // Export analytics data
```

### Social Platform Integration
```typescript
GET  /api/social/auth/[platform]  // OAuth initiation
POST /api/social/callback/[platform] // OAuth callback
POST /api/social/publish          // Publish content
GET  /api/social/accounts         // Get connected accounts
```

## 📱 UI/UX Structure

### Main Layout (3-column grid)
```
┌─────────────────┬─────────────────────────────┬─────────────────┐
│   Content      │       Preview & Activity    │   Settings     │
│   Creation     │                           │   & Actions    │
│                │                           │                │
│ • Account      │ • Platform previews        │ • Post type    │
│   selection   │ • Engagement metrics      │ • Scheduling   │
│ • Text editor │ • Real-time updates       │ • Labels       │
│ • Media upload │ • Activity history         │ • Publishing    │
│ • AI assist   │                           │                │
└─────────────────┴─────────────────────────────┴─────────────────┘
```

### Interactive Elements
- **Drag & Drop Media**: Intuitive file upload
- **Character Counters**: Real-time limit enforcement
- **Platform Switching**: Seamless account switching
- **Live Previews**: Instant visual feedback
- **AI Generation**: One-click content creation
- **Quick Actions**: Keyboard shortcuts support

## 🔧 Configuration

### Environment Variables
```bash
# Meta Business Manager
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
META_BUSINESS_ID=your_business_id

# API Endpoints
FACEBOOK_API_VERSION=v19.0
META_GRAPH_URL=https://graph.facebook.com

# Webhooks
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
META_WEBHOOK_SECRET=your_webhook_secret
```

### Database Configuration
```sql
-- Required indexes for performance
CREATE INDEX idx_posts_business_scheduled ON posts(businessId, scheduledFor);
CREATE INDEX idx_posts_platform_status ON posts(platform, status);
CREATE INDEX idx_analytics_updated ON post_analytics(updatedAt);
```

## 📈 Performance Considerations

### API Rate Limits
- **Facebook**: 200 calls per hour per user
- **Instagram**: 200 calls per hour per user
- **Batch Processing**: Group requests to minimize API calls
- **Caching**: Cache insights data for 15-30 minutes

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Partitioning**: Consider time-based partitioning for large datasets
- **Cleanup**: Regular cleanup of old analytics data

### Frontend Performance
- **Lazy Loading**: Load analytics data on demand
- **Virtual Scrolling**: For large post lists
- **Image Optimization**: Compress and resize media uploads
- **Debounced Saving**: Prevent excessive auto-save calls

## 🚨 Error Handling

### Common Scenarios
1. **Token Expiration**: Automatic refresh with user notification
2. **API Rate Limits**: Queue requests with exponential backoff
3. **Media Upload Failures**: Retry with compression
4. **Permission Errors**: Clear error messages with re-auth option
5. **Network Issues**: Offline mode with sync on reconnect

### User Feedback
- **Toast Notifications**: Success/error messages
- **Progress Indicators**: Loading states for all operations
- **Error Recovery**: Clear paths to resolve issues
- **Status Badges**: Visual indicators for post status

## 🔒 Security Considerations

### Data Protection
- **Token Encryption**: Store access tokens encrypted
- **HTTPS Only**: All API calls over HTTPS
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse of API endpoints

### Access Control
- **Business Scoping**: Users can only access their own data
- **Permission Validation**: Verify required scopes before operations
- **Audit Logging**: Track all significant actions
- **Session Management**: Secure session handling

## 📚 Testing Strategy

### Unit Tests
- Service layer functions
- API endpoint responses
- Data validation logic
- Error handling scenarios

### Integration Tests
- Platform API integration
- Database operations
- OAuth flow testing
- Analytics accuracy

### End-to-End Tests
- Complete posting workflow
- Multi-platform publishing
- Analytics tracking
- User interactions

## 🚀 Deployment

### Production Checklist
- [ ] Meta App Review completed
- [ ] All required scopes approved
- [ ] Webhook endpoints configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Monitoring and logging enabled
- [ ] Performance testing completed

### Monitoring
- **API Response Times**: Track platform API performance
- **Error Rates**: Monitor failed requests
- **User Engagement**: Track feature usage
- **System Health**: Database and service monitoring

## 🔄 Future Enhancements

### Planned Features
- **Advanced Scheduling**: Bulk scheduling with optimal times
- **Content Templates**: Reusable post templates
- **Collaboration**: Team approval workflows
- **Advanced Analytics**: Sentiment analysis, demographic insights
- **Automation**: AI-powered posting suggestions
- **Multi-language**: Support for international content

### Platform Expansion
- **Pinterest**: Visual discovery platform
- **LinkedIn**: Professional networking
- **TikTok**: Short-form video content
- **YouTube**: Long-form video content
- **Twitter**: Real-time updates

---

## 📞 Support

For issues or questions regarding the social media posting feature:

1. **Documentation**: Refer to this guide and inline code comments
2. **Logs**: Check system logs for detailed error information
3. **Monitoring**: Review performance metrics and error rates
4. **Community**: Engage with the development community for best practices

---

*This implementation provides a comprehensive, scalable, and user-friendly social media posting system with enterprise-grade analytics and multi-platform support.*
