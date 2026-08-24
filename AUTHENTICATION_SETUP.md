# Authentication System Setup

This project uses Better Auth for authentication with OAuth 2.0 (Google) and manual email/password registration.

## Features

- ✅ OAuth 2.0 login (Google)
- ✅ Manual user registration (name, email, password)
- ✅ Secure user login (email + password)
- ✅ JWT-based session management
- ✅ PostgreSQL database with Prisma
- ✅ Secure password hashing (bcrypt)
- ✅ Input validation and error handling
- ✅ Protected routes with middleware
- ✅ Logout functionality
- ✅ Modern security best practices

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env` file

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Create migration
npx prisma migrate dev --name init-auth
```

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET/POST /api/auth/*` - Better Auth handler (OAuth, sessions, etc.)

### Example API Usage

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: session_token=your_session_token"
```

## Client-Side Usage

### React Components

Import the auth client and use the provided components:

```tsx
import { authClient } from "@/lib/auth-client";
import { LoginForm, RegisterForm, UserProfile } from "@/components/auth";

// Use in your pages
<LoginForm />
<RegisterForm />
<UserProfile />
```

### Manual Auth Calls

```tsx
// Sign in
const result = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Sign up
const result = await authClient.signUp.email({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
});

// Social sign in
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// Sign out
await authClient.signOut();

// Get session
const session = await authClient.getSession();
```

## Protected Routes

The middleware automatically protects routes. Public routes are:
- `/`
- `/login`
- `/register`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/ok`

All other routes require authentication.

## Database Schema

The authentication system uses these tables:

- `users` - User accounts
- `accounts` - OAuth provider accounts
- `sessions` - User sessions

## Security Features

- Password hashing with bcrypt (12 rounds)
- Secure session management with JWT
- CSRF protection
- Input validation with Zod
- Rate limiting ready
- HTTPS only in production

## Folder Structure

```
├── lib/
│   ├── auth.ts              # Better Auth configuration
│   └── auth-client.ts       # Client-side auth helper
├── app/api/auth/
│   ├── [...nextauth]/route.ts # Better Auth handler
│   ├── register/route.ts    # Registration endpoint
│   ├── login/route.ts       # Login endpoint
│   ├── logout/route.ts      # Logout endpoint
│   └── me/route.ts          # Current user endpoint
├── components/auth/
│   ├── login-form.tsx       # Login component
│   ├── register-form.tsx    # Registration component
│   └── user-profile.tsx     # User profile component
└── proxy.ts                # Route protection proxy (Next.js 16+)
```

## Testing

To test the authentication system:

1. Start the development server
2. Navigate to `/login` or `/register`
3. Test email/password authentication
4. Test Google OAuth (requires Google OAuth setup)
5. Verify protected routes redirect to login
6. Test session persistence and logout

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **Google OAuth**: Verify redirect URIs in Google Console
3. **Session Issues**: Check `BETTER_AUTH_SECRET` is set
4. **CORS Issues**: Ensure `BETTER_AUTH_URL` matches your app URL

### Debug Mode

Set `NODE_ENV=development` to see detailed auth logs.
