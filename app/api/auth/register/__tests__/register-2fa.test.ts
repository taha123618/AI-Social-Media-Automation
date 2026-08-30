import { POST as sendOtpHandler } from '../send-otp/route';
import { POST as verifyOtpHandler } from '../verify-otp/route';
import { POST as resendOtpHandler } from '../resend-otp/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendRegisterOtpEmail } from '@/lib/email-service';

jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  verification: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: jest.fn(),
    },
  },
}));

jest.mock('@/lib/email-service', () => ({
  sendRegisterOtpEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logAudit: jest.fn().mockResolvedValue(true),
    logError: jest.fn().mockResolvedValue(true),
  },
}));

describe('Registration 2FA OTP System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register/send-otp', () => {
    it('validates password strength and rejects weak passwords', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'weak',
        }),
      });

      const res = await sendOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('rejects if an account with the email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_existing',
        email: 'sarah@example.com',
      });

      const req = new NextRequest('http://localhost:3000/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
        }),
      });

      const res = await sendOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toContain('already exists');
    });

    it('generates 6-digit OTP, stores in DB, and dispatches email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.verification.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.verification.create as jest.Mock).mockResolvedValue({
        id: 'verif_123',
        identifier: 'register-otp:sarah@example.com',
        value: '654321',
        expiresAt: new Date(Date.now() + 600000),
      });

      const req = new NextRequest('http://localhost:3000/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
        }),
      });

      const res = await sendOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: 'register-otp:sarah@example.com',
          value: expect.stringMatching(/^\d{6}$/),
        }),
      });
      expect(sendRegisterOtpEmail).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/register/verify-otp', () => {
    it('rejects expired OTP codes', async () => {
      (prisma.verification.findFirst as jest.Mock).mockResolvedValue({
        id: 'verif_123',
        identifier: 'register-otp:sarah@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() - 1000), // Expired
      });

      const req = new NextRequest('http://localhost:3000/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
          otp: '123456',
        }),
      });

      const res = await verifyOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('expired');
    });

    it('rejects mismatched OTP codes', async () => {
      (prisma.verification.findFirst as jest.Mock).mockResolvedValue({
        id: 'verif_123',
        identifier: 'register-otp:sarah@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 600000),
      });

      const req = new NextRequest('http://localhost:3000/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
          otp: '999999', // Mismatched
        }),
      });

      const res = await verifyOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Incorrect');
    });

    it('successfully verifies OTP, registers user, and sets emailVerified=true', async () => {
      (prisma.verification.findFirst as jest.Mock).mockResolvedValue({
        id: 'verif_123',
        identifier: 'register-otp:sarah@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 600000),
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (auth.api.signUpEmail as unknown as jest.Mock).mockResolvedValue({
        user: {
          id: 'usr_new_123',
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          image: null,
        },
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost:3000/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
          otp: '123456',
        }),
      });

      const res = await verifyOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('sarah@example.com');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr_new_123' },
        data: { emailVerified: true },
      });
    });
  });

  describe('POST /api/auth/register/resend-otp', () => {
    it('enforces 60-second cooldown between resend requests', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.verification.findFirst as jest.Mock).mockResolvedValue({
        id: 'verif_recent',
        identifier: 'register-otp:sarah@example.com',
        value: '123456',
        createdAt: new Date(Date.now() - 20000), // 20s ago (within 60s cooldown)
      });

      const req = new NextRequest('http://localhost:3000/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sarah@example.com',
          name: 'Sarah Connor',
        }),
      });

      const res = await resendOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toContain('wait');
    });

    it('generates new OTP and sends email when cooldown elapsed', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.verification.findFirst as jest.Mock).mockResolvedValue({
        id: 'verif_old',
        identifier: 'register-otp:sarah@example.com',
        value: '123456',
        createdAt: new Date(Date.now() - 75000), // 75s ago (cooldown expired)
      });
      (prisma.verification.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.verification.create as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost:3000/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sarah@example.com',
          name: 'Sarah Connor',
        }),
      });

      const res = await resendOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(sendRegisterOtpEmail).toHaveBeenCalled();
    });
  });
});
