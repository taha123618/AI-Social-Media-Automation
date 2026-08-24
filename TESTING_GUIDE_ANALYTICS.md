# 🧪 Complete Analytics Testing Guide

## Overview

This guide covers testing for all Phase 4 analytics features:
- ✅ Lead Tracking (Phase 4.1)
- ✅ Consistency Scorer (Phase 4.2)
- ✅ Revenue Attribution (Phase 4.3)
- ✅ UI Components (All phases)

---

## 📋 Pre-Testing Setup

### **Step 1: Database Migration**

```bash
cd /var/www/html/ai_social_media_automation

# Generate Prisma client with new models
npx prisma generate

# Apply migrations
npx prisma migrate dev --name add_analytics_features
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Created migration
✔ Applied migration
```

---

### **Step 2: Verify Files Exist**

```bash
# Check backend services
ls -la features/analytics/services/
# Should see:
# - lead-tracking.service.ts
# - consistency-scorer.service.ts
# - revenue-attribution.service.ts

# Check API routes
ls -la app/api/analytics/
# Should see:
# - leads/
# - consistency/
# - revenue/

# Check UI components
ls -la app/(user)/analytics/_components/
# Should see:
# - consistency-score-ui.tsx
# - lead-stats-ui.tsx
```

---

## 🎯 Test 1: Lead Tracking API

### **Endpoint:** `POST /api/analytics/leads/track`

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/analytics/leads/track \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "postId": "test_post_123",
    "businessId": "your_business_id",
    "leadType": "PHONE_CALL",
    "metadata": {
      "source": "INSTAGRAM_STORY",
      "value": 50
    }
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "analyticsId": "analytics_xxx",
  "leadId": "lead_yyy"
}
```

**Expected Response (Error):**
```json
{
  "error": "Unauthorized"
}
// or
{
  "error": "Missing required fields"
}
```

---

### **Endpoint:** `GET /api/analytics/leads/summary`

**Test Command:**
```bash
curl -X GET "http://localhost:3000/api/analytics/leads/summary?businessId=your_business_id&days=30" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 47,
    "byType": {
      "phoneCalls": 12,
      "messages": 8,
      "websiteVisits": 20,
      "bookings": 5,
      "directions": 2
    },
    "estimatedValue": 2150,
    "topPerformingPosts": [...],
    "conversionRate": {
      "totalPosts": 30,
      "postsWithLeads": 18,
      "conversionRate": "60.0%"
    }
  }
}
```

---

## 🎯 Test 2: Consistency Scorer API

### **Endpoint:** `GET /api/analytics/consistency/score`

**Test Command:**
```bash
curl -X GET "http://localhost:3000/api/analytics/consistency/score?businessId=your_business_id&days=90" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overall": 72,
    "frequency": 65,
    "streak": 14,
    "optimalTiming": 45,
    "recommendation": "Good progress! Try to post 1-2 more times per week...",
    "trend": "improving"
  }
}
```

**Score Interpretation:**
- **80-100**: Excellent consistency
- **60-79**: Good, room for improvement
- **40-59**: Needs work
- **<40**: Poor consistency

---

### **Endpoint:** `GET /api/analytics/consistency/analytics`

**Test Command:**
```bash
curl -X GET "http://localhost:3000/api/analytics/consistency/analytics?businessId=your_business_id" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 87,
    "averagePerWeek": 4.2,
    "bestDay": "Wednesday",
    "bestTime": 18,
    "consistencyScore": {
      "overall": 72,
      "frequency": 65,
      "streak": 14,
      "optimalTiming": 45,
      "recommendation": "...",
      "trend": "improving"
    }
  }
}
```

---

## 🎯 Test 3: Revenue Attribution API

### **Endpoint:** `GET /api/analytics/revenue`

**Test Command:**
```bash
curl -X GET "http://localhost:3000/api/analytics/revenue?businessId=your_business_id&days=90" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "attribution": {
      "totalRevenue": 3225,
      "attributedRevenue": 2150,
      "attributionRate": 67,
      "roi": 330,
      "revenueByPost": [...],
      "revenueByLeadType": {...},
      "averageCustomerValue": 500,
      "projectedAnnualRevenue": 8600
    },
    "channelROI": [...],
    "multiTouch": [...]
  }
}
```

---

## 🎨 Test 4: UI Components

### **Access the Dashboard**

**URL:** `http://localhost:3000/analytics`

**What You Should See:**

```
┌─────────────────────────────────────┐
│  Growth Analytics                   │
│  Track your social media ROI        │
├─────────────────────────────────────┤
│ [Consistency: 72] [Leads: 47] [$2,150]│
├─────────────────────────────────────┤
│ [Consistency Score Tab] [Lead Tracking Tab]│
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Circular Score: 72/100         │  │
│ │ Trend: ↑ Improving             │  │
│ │                                │  │
│ │ Frequency:    65/100 ████▒▒▒▒ │  │
│ │ Streak:       14 days ████████ │  │
│ │ Optimal Timing: 45/100 ██▒▒▒▒▒ │  │
│ │                                │  │
│ │ 💡 Recommendation:              │  │
│ │ "Good progress!..."            │  │
│ └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

### **UI Test Checklist**

**Page Load:**
- [ ] Dashboard loads without errors
- [ ] Stats cards display at top
- [ ] Tabs are clickable
- [ ] No console errors in browser DevTools

**Consistency Score Tab:**
- [ ] Circular score animation works
- [ ] Progress bars animate on load
- [ ] Score colors are correct (green/yellow/red)
- [ ] Trend icon displays (↑ → ↓)
- [ ] Recommendation shows helpful text
- [ ] Stats show total posts, avg/week, best time

**Lead Tracking Tab:**
- [ ] 4 stat cards display (Total Leads, Revenue, Conversion Rate, Avg Value)
- [ ] Lead breakdown by type with icons
- [ ] Progress bars animate
- [ ] Conversion funnel displays
- [ ] Top performing posts list shows

**Responsiveness:**
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] No horizontal scrolling

---

## 🐛 Common Issues & Fixes

### **Issue 1: "Property 'lead' does not exist"**

**Error:**
```
Property 'lead' does not exist on type 'PrismaClient'
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# If still failing, reset database
npx prisma migrate reset
npx prisma generate
```

---

### **Issue 2: 401 Unauthorized**

**Problem:** API returns unauthorized even when logged in

**Solution:**
```javascript
// Make sure to include auth cookies
const response = await fetch('/api/analytics/...', {
  headers: {
    // Browser automatically includes cookies for same-origin
  },
  credentials: 'include' // Important!
});
```

---

### **Issue 3: Dashboard Shows 0 for All Stats**

**Cause:** No data in database or mock data not loading

**Check:**
1. Open browser DevTools → Network tab
2. Look for API calls to `/api/analytics/...`
3. Check if they return data
4. If returning empty arrays, that's expected with no data

**Fix:** Either:
- Add real data via API calls
- Or use mock data in component (currently enabled)

---

### **Issue 4: TypeScript Errors in Service Files**

**Common Error:**
```
Unexpected any. Specify a different type.
```

**Solution:**
These are linting warnings, not blocking errors. The code will still compile. Fix them later by adding proper types.

---

### **Issue 5: Progress Component Not Found**

**Error:**
```
Cannot find module '@/components/ui/progress'
```

**Solution:**
We replaced Progress with custom Framer Motion implementation. Make sure you're using the latest code that doesn't import Progress.

---

## 📊 Test Data Generator

Want to test with realistic data? Run this script:

```typescript
// scripts/generate-test-analytics.ts
import prisma from '../lib/prisma';

async function generateTestData() {
  const businessId = 'your_business_id';

  // Create 50 test posts
  for (let i = 0; i < 50; i++) {
    const post = await prisma.post.create({
      data: {
        businessId,
        creatorId: 'user_id',
        draftId: 'draft_id',
        platform: 'INSTAGRAM',
        socialAccountId: 'account_id',
        postedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      }
    });

    // Create analytics for each post
    await prisma.postAnalytics.create({
      data: {
        postId: post.id,
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        phoneClicks: Math.floor(Math.random() * 5),
        messageClicks: Math.floor(Math.random() * 3),
        websiteClicks: Math.floor(Math.random() * 10)
      }
    });
  }

  // Create 30 test leads
  const leadTypes = ['PHONE_CALL', 'MESSAGE', 'WEBSITE_VISIT', 'BOOKING', 'DIRECTIONS'];
  for (let i = 0; i < 30; i++) {
    await prisma.lead.create({
      data: {
        businessId,
        postId: null, // or random post ID
        leadType: leadTypes[Math.floor(Math.random() * leadTypes.length)],
        source: 'SOCIAL_MEDIA',
        estimatedValue: 25 + Math.random() * 75,
        status: 'NEW'
      }
    });
  }

  console.log('✅ Test data generated!');
}

generateTestData().catch(console.error);
```

---

## ✅ Success Criteria

**All tests pass if:**

✅ All API endpoints return valid JSON
✅ Consistency score is between 0-100
✅ Lead tracking counts are accurate
✅ Revenue attribution calculates correctly
✅ UI renders without errors
✅ Animations work smoothly
✅ No console errors
✅ Responsive on all devices

---

## 🚀 Next Steps After Testing

**If All Tests Pass:**
1. ✅ Analytics system is production-ready
2. ✅ Move to Phase 4.4 (Growth Dashboard)
3. ✅ Integrate with real business data
4. ✅ Add notification system for milestones

**If Tests Fail:**
1. 📝 Document specific failures
2. 🔧 Fix issues before proceeding
3. 🧪 Re-test until all pass

---

## 💡 Developer Tips

**Debugging Tips:**
- Use `console.log()` in API routes to see data
- Check Network tab in browser for API responses
- Verify Prisma queries return expected data
- Test with Postman/curl before UI testing

**Performance Tips:**
- Add caching for expensive calculations
- Use Redis for frequently accessed stats
- Implement pagination for large datasets
- Consider background jobs for heavy computations

---

**Ready to test? Start with Step 1 (Database Migration) and work through each test systematically!** 🎉

For questions or issues, check the individual phase documentation:
- PHASE_4_1_COMPLETE.md
- PHASE_4_2_COMPLETE.md
- PHASE_4_3_COMPLETE.md
