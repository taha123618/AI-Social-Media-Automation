# 🔧 Troubleshooting Review System Errors

## Error: "Unexpected token '<', "<!DOCTYPE "..."

This error means the API is returning HTML (an error page) instead of JSON.

### Common Causes & Solutions:

---

## 1️⃣ **Not Authenticated**

**Problem:** You're calling the API without being logged in.

**Solution:**
- Make sure you're logged into the application
- The API requires authentication via `auth.api.getSession()`
- Check browser console for auth errors

**Test:**
```bash
# Call with auth cookie
curl -X POST http://localhost:3000/api/reviews/request \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"businessId":"xxx","customerName":"John","customerEmail":"john@example.com"}'
```

---

## 2️⃣ **Database Not Migrated**

**Problem:** Review models don't exist in the database yet.

**Solution:**
```bash
# Apply migrations
npx prisma migrate dev --name add_review_system
npx prisma generate
```

**Verify:**
```bash
# Check if Review table exists
psql -U postgres -d your_database -c "\dt"
```

---

## 3️⃣ **Missing Environment Variables**

**Problem:** Required env vars are not set.

**Required `.env`:**
```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"

# Redis (for email queue)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 4️⃣ **API Route Not Compiled**

**Problem:** Next.js hasn't compiled the route yet.

**Solution:**
```bash
# Restart dev server
npm run dev

# Or rebuild
npm run build
```

**Check compilation:**
- Look at terminal output for any errors
- Visit `http://localhost:3000/api/reviews/request` in browser (should show 404 or method not allowed, NOT a compilation error)

---

## 5️⃣ **Invalid Request Body**

**Problem:** Sending malformed JSON or missing required fields.

**Required Fields:**
```json
{
  "businessId": "biz_123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/reviews/request \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "test-business",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "channel": "EMAIL"
  }'
```

---

## 6️⃣ **Redis Not Running**

**Problem:** Email queue requires Redis but it's not running.

**Solution:**
```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Or use local Redis
redis-server
```

**Test:**
```bash
redis-cli ping  # Should return PONG
```

---

## 7️⃣ **Business Doesn't Exist**

**Problem:** The businessId you're using doesn't exist.

**Solution:**
- Create a business first through onboarding
- Or use an existing business ID from your database

**Find valid business ID:**
```bash
psql -U postgres -d your_db -c "SELECT id, name FROM \"Business\" LIMIT 5;"
```

---

## 🧪 Quick Test Script

Create a test file `test-review-request.ts`:

```typescript
// Run with: npx tsx test-review-request.ts

async function testReviewRequest() {
  const response = await fetch('http://localhost:3000/api/reviews/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: 'YOUR_BUSINESS_ID',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      channel: 'EMAIL'
    })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
}

testReviewRequest();
```

---

## 📝 Debug Checklist

- [ ] Logged into the application
- [ ] Database migrations applied (`npx prisma migrate dev`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Environment variables set (`.env`)
- [ ] Redis running (`redis-server` or Docker)
- [ ] Valid business ID used
- [ ] Dev server running (`npm run dev`)
- [ ] No TypeScript compilation errors

---

## 🎯 Expected Response

**Success:**
```json
{
  "success": true,
  "requestId": "clx_abc123",
  "message": "Review request sent via EMAIL"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error (400):**
```json
{
  "error": "Missing required fields"
}
```

---

## 🔍 Still Not Working?

1. **Check browser console** - Look for network errors
2. **Check server logs** - Look for error messages in terminal
3. **Try direct DB query** - Verify data exists
4. **Simplify the test** - Try with minimal payload first

---

## 💡 Pro Tips

- Always check the **full error message** in the response
- Use **Postman/Insomnia** for easier API testing
- Enable **Next.js debug mode** by setting `DEBUG=*`
- Check **Prisma query logs** by adding `log: ['query']` to Prisma config
