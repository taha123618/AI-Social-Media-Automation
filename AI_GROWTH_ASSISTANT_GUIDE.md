# 🚀 AI Growth Assistant - User Guide

## Welcome to Your AI Growth Assistant!

Your platform now includes powerful automation features designed to make social media marketing effortless for local businesses.

---

## ✨ New Features Available

### 1. 30-Day Autopilot Mode 🎯

**What it does:** Automatically generates and schedules 30 days of engaging social media posts tailored to your industry.

**How to use:**
1. Navigate to **Content Library** (`/contents`)
2. Click the purple **"30-Day Autopilot"** button at the top right
3. The system will automatically:
   - Analyze your business type (restaurant, salon, contractor, etc.)
   - Select industry-specific templates
   - Generate strategic offers for your business
   - Create 30-40 posts over 30 days
   - Schedule posts at optimal times for your industry
   - Mix content types: educational, promotional, engagement, testimonials

**What you get:**
- ✅ Industry-specific captions
- ✅ Relevant hashtags
- ✅ Strategic CTAs (calls-to-action)
- ✅ Optimal posting times
- ✅ Balanced content mix
- ✅ Ready to review & approve

**After generation:**
- Posts are created as drafts in "GENERATED" status
- Review each post individually or approve all at once
- Edit any post before scheduling
- Posts are automatically scheduled across your connected platforms

---

### 2. Drag & Drop Media Upload 📸

**What it does:** Easy upload of photos and images directly to your content library.

**How to use:**
1. Go to **Content Library**
2. Look for the upload area
3. Drag and drop your photos (before/after shots, job photos, products)
4. Or click to browse and select files
5. Upload progress is shown in real-time
6. Uploaded media is stored securely in S3

**Supported formats:** JPEG, PNG, GIF, WebP
**Max file size:** 10MB per image

---

### 3. Business Onboarding (For New Users) 🏢

**What it does:** Makes setup effortless by automatically extracting your business information from your website.

**Features:**
- Select from 17 local business types
- Enter your website URL
- AI scans and extracts: services, hours, location, contact info
- Automatic brand voice generation
- Pre-configured industry templates

**Access:** Available during initial setup or in Settings

---

## 💡 Best Practices

### For Restaurants:
- Post 5 times per week
- Share before/after dish photos
- Highlight daily specials
- Tag locations
- Use food-related hashtags

### For Salons:
- Post transformations (before/after)
- Showcase new styles
- Promote weekend availability
- Use beauty hashtags
- Tag products used

### For Contractors:
- Show completed projects
- Share customer testimonials
- Post problem-solution content
- Highlight licenses/certifications
- Use local hashtags

---

## 📊 Content Mix Strategy

Your autopilot uses this proven mix:
- **30% Educational** - Tips, how-tos, expertise
- **30% Promotional** - Offers, services, products
- **25% Engagement** - Questions, transformations, behind-the-scenes
- **15% Testimonials** - Reviews, success stories

This balance keeps your audience engaged while driving revenue.

---

## 🎯 How to Get Started

1. **Complete Your Profile**
   - Ensure your business type is selected
   - Add your website for auto-extraction
   - Connect your social media accounts

2. **Generate Your First Autopilot**
   - Click "30-Day Autopilot"
   - Wait 30-60 seconds for generation
   - Review your personalized content plan

3. **Upload Media**
   - Add your best photos
   - Organize by category (projects, products, team)
   - Use high-quality images

4. **Review & Approve**
   - Check each generated post
   - Customize as needed
   - Approve for scheduling

5. **Watch It Work**
   - Posts go live automatically
   - Track engagement in Analytics
   - Monitor leads and results

---

## 🔧 Technical Setup (Admin)

If you're setting up the system, ensure:

### Environment Variables
```env
# AWS S3 for media storage
AWS_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Database Migration
```bash
npx prisma migrate dev --name add_business_onboarding_and_reviews
npx prisma generate
```

### Install Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner cheerio
npm install --save-dev @types/cheerio
```

---

## 📈 Expected Results

With consistent use:
- **Posting frequency:** 3-5x per week (industry-dependent)
- **Time saved:** 10-15 hours/month on content creation
- **Engagement increase:** 40-60% within 60 days
- **Lead generation:** Trackable through post analytics

---

## 🆘 Need Help?

- Check individual feature documentation
- Review template examples in Settings
- Contact support for assistance

---

**Remember:** This is your AI Growth Assistant - designed to be simple, clear, and revenue-focused. Let automation handle the heavy lifting while you focus on running your business! 💪
