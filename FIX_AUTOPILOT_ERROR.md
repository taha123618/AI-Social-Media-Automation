# 🔧 Fixing "Unexpected token '<'" Error in Autopilot Generator

## Problem
You're getting this error when trying to generate autopilot content:
```
Generation Failed: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Root Cause
This means Next.js is returning an **HTML error page** instead of JSON. Common causes:

---

## ✅ Quick Fixes (Try These First)

### 1. **Check if Business Exists**

The most common issue - the business ID doesn't exist or isn't accessible.

**Solution:**
```bash
# Query your database
psql -U postgres -d your_database -c "SELECT id, name FROM \"Business\";"
```

Use a valid business ID from the results.

---

### 2. **Verify Database Schema**

Make sure all required tables exist:

```bash
cd /var/www/html/ai_social_media_automation
npx prisma migrate dev
npx prisma generate
```

---

### 3. **Test with Health Endpoint**

Visit in browser:
```
http://localhost:3000/api/autopilot/generate
```

You should get a 405 (Method Not Allowed) or JSON error - NOT an HTML page.

If you see HTML, there's a compilation error. Check terminal output.

---

### 4. **Use the Test Component**

I've created a test UI at `/contents` page that includes better error handling.

Add this to your contents page temporarily:

```tsx
import { AutopilotTest } from './_components/autopilot-test';

// In your page component
<AutopilotTest />
```

This will show detailed error messages and help you debug.

---

## 🐛 Common Issues & Solutions

### Issue 1: Business Profile Table Missing

**Error in terminal:**
```
Table 'BusinessProfile' doesn't exist
```

**Solution:**
```bash
npx prisma migrate dev --name fix_business_profile
```

Or the code will now automatically fall back to using `businessType` field instead.

---

### Issue 2: Invalid Business ID

**Symptom:** Error immediately on generation

**Solution:** Make sure you're using a real business ID:

```typescript
// Valid IDs from your database
const businessId = "clx_abc123"; // ✅ Real ID
const businessId = "test";       // ❌ Won't work
```

---

### Issue 3: Missing Creator ID

**Symptom:** Error about creator/user

**Solution:** Use your user ID from the session:

```typescript
const creatorId = session.user.id; // From auth session
```

---

### Issue 4: Platform Enum Mismatch

**Symptom:** TypeScript/build errors about Platform type

**Solution:** Make sure platforms match the enum:

```typescript
// ✅ Correct
platforms: ['INSTAGRAM', 'FACEBOOK']

// ❌ Wrong
platforms: ['instagram', 'facebook']
```

---

## 🧪 Manual Testing

### Option A: Browser Console Test

Open browser console on `/contents` page and run:

```javascript
fetch('/api/autopilot/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessId: 'YOUR_BUSINESS_ID',
    creatorId: 'YOUR_USER_ID',
    days: 7,
    platforms: ['INSTAGRAM']
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Option B: curl Test

```bash
curl -X POST http://localhost:3000/api/autopilot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "creatorId": "your-user-id",
    "days": 7,
    "platforms": ["INSTAGRAM"]
  }'
```

---

## 📊 Expected Response

**Success:**
```json
{
  "success": true,
  "data": {
    "plan": [...],
    "draftsCreated": 3,
    "message": "Successfully created 3 drafts for 7-day autopilot"
  }
}
```

**Error (400):**
```json
{
  "error": "Business ID and Creator ID are required"
}
```

---

## 🔍 Debug Checklist

Run through these checks:

- [ ] Dev server is running (`npm run dev`)
- [ ] No TypeScript errors in terminal
- [ ] Database migrations applied
- [ ] Prisma client generated
- [ ] Using valid business ID
- [ ] Using valid creator ID
- [ ] Platforms array is not empty
- [ ] Content-Type header is `application/json`
- [ ] X-Auto-Create header is set (if creating drafts)

---

## 💡 Pro Tips

1. **Check Terminal Logs** - Look for detailed error messages
2. **Enable Debug Mode** - Set `DEBUG=*` env var
3. **Use DevTools Network Tab** - See exact request/response
4. **Try Minimal Payload** - Start with just required fields

---

## 🆘 Still Not Working?

1. **Restart Everything:**
   ```bash
   # Stop dev server
   # Clear .next folder
   rm -rf .next

   # Restart
   npm run dev
   ```

2. **Check Database Connection:**
   ```bash
   npx prisma db pull
   ```

3. **Look for Compilation Errors:**
   - Check terminal for red error messages
   - Visit any API route in browser to test

---

## 📝 Code Improvements Made

I've added:
- ✅ Better error handling in API route
- ✅ JSON parsing with fallback
- ✅ Detailed error logging
- ✅ Fallback if BusinessProfile doesn't exist
- ✅ More descriptive error messages

These changes will help identify the exact issue!
