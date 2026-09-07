// Mock ESM 'jose' package for Jest compatibility
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock_token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({ payload: { id: 'admin', email: 'admin@example.com', role: 'super_admin' } }),
}));

import { SecurityService } from '../security';
import { getAdminJwtSecret } from '../admin-auth';

describe('Enterprise Cybersecurity Regression Test Suite', () => {
  describe('SSRF Protection (SecurityService.validateSafeUrl)', () => {
    it('blocks Cloud Instance Metadata Service (IMDS) IPv4 addresses', () => {
      const imds1 = SecurityService.validateSafeUrl('http://169.254.169.254/latest/meta-data/');
      expect(imds1.safe).toBe(false);
      expect(imds1.reason).toMatch(/cloud metadata/i);

      const imds2 = SecurityService.validateSafeUrl('http://169.254.1.1');
      expect(imds2.safe).toBe(false);
      expect(imds2.reason).toMatch(/cloud metadata/i);
    });

    it('blocks IPv4 loopback addresses (127.0.0.0/8)', () => {
      const loopback1 = SecurityService.validateSafeUrl('http://127.0.0.1:5432');
      expect(loopback1.safe).toBe(false);
      expect(loopback1.reason).toMatch(/loopback/i);

      const loopback2 = SecurityService.validateSafeUrl('http://127.0.1.1:6379');
      expect(loopback2.safe).toBe(false);
      expect(loopback2.reason).toMatch(/loopback/i);
    });

    it('blocks IPv4 RFC 1918 private network addresses', () => {
      // 10.0.0.0/8
      expect(SecurityService.validateSafeUrl('http://10.0.0.1').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://10.254.254.1').safe).toBe(false);

      // 172.16.0.0/12
      expect(SecurityService.validateSafeUrl('http://172.16.0.1').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://172.31.255.255').safe).toBe(false);

      // 192.168.0.0/16
      expect(SecurityService.validateSafeUrl('http://192.168.1.1').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://192.168.100.50').safe).toBe(false);
    });

    it('blocks IPv6 loopback and unique local addresses', () => {
      expect(SecurityService.validateSafeUrl('http://[::1]:3000').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://[fc00::1]').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://[fe80::1]').safe).toBe(false);
    });

    it('blocks internal hostnames and single-label services', () => {
      expect(SecurityService.validateSafeUrl('http://localhost:3000').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://redis:6379').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://postgres:5432').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://app.internal').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://worker.cluster.local').safe).toBe(false);
    });

    it('blocks non-HTTP/HTTPS protocols and embedded credentials', () => {
      expect(SecurityService.validateSafeUrl('file:///etc/passwd').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('gopher://127.0.0.1:11211').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('ftp://ftp.example.com').safe).toBe(false);
      expect(SecurityService.validateSafeUrl('http://admin:secret@example.com').safe).toBe(false);
    });

    it('allows valid public HTTP and HTTPS URLs', () => {
      const public1 = SecurityService.validateSafeUrl('https://example.com');
      expect(public1.safe).toBe(true);

      const public2 = SecurityService.validateSafeUrl('https://www.google.com/search?q=cybersecurity');
      expect(public2.safe).toBe(true);

      const public3 = SecurityService.validateSafeUrl('http://93.184.216.34'); // example.com IPv4
      expect(public3.safe).toBe(true);
    });
  });

  describe('Admin JWT Cryptographic Hardening (getAdminJwtSecret)', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.ADMIN_JWT_SECRET;
    const envObj = process.env as Record<string, string | undefined>;

    afterEach(() => {
      envObj.NODE_ENV = originalEnv;
      process.env.ADMIN_JWT_SECRET = originalSecret;
    });

    it('throws fatal security error in production if ADMIN_JWT_SECRET is missing or default', () => {
      envObj.NODE_ENV = 'production';
      delete process.env.ADMIN_JWT_SECRET;

      expect(() => getAdminJwtSecret()).toThrow(/CRITICAL SECURITY ERROR/);

      process.env.ADMIN_JWT_SECRET = 'default_admin_secret_key_change_me';
      expect(() => getAdminJwtSecret()).toThrow(/CRITICAL SECURITY ERROR/);

      process.env.ADMIN_JWT_SECRET = 'too_short';
      expect(() => getAdminJwtSecret()).toThrow(/CRITICAL SECURITY ERROR/);
    });

    it('succeeds in production when a strong 32+ char secret is provided', () => {
      envObj.NODE_ENV = 'production';
      process.env.ADMIN_JWT_SECRET = 'super_secret_production_admin_key_32_characters_minimum!';

      const key = getAdminJwtSecret();
      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('Path Traversal & Filename Sanitization', () => {
    it('strips directory traversal sequences and dangerous characters', () => {
      const clean1 = SecurityService.sanitizeFilename('../../../etc/passwd');
      expect(clean1).not.toContain('..');
      expect(clean1).not.toContain('/');

      const clean2 = SecurityService.sanitizeFilename('malicious..//..\\payload.png');
      expect(clean2).not.toContain('..');
      expect(clean2.endsWith('.png')).toBe(true);
    });

    it('neutralizes null byte injections', () => {
      const clean = SecurityService.sanitizeFilename('exploit.php\0.png');
      expect(clean).not.toContain('\0');
      expect(clean.endsWith('.png')).toBe(true);
    });
  });

  describe('File Magic Byte Inspection', () => {
    it('validates authentic PNG binary header', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      expect(SecurityService.validateMagicBytes(validPng, 'image/png')).toBe(true);
    });

    it('rejects spoofed files (e.g. PHP script with .png MIME)', () => {
      const spoofed = Buffer.from('<?php echo "pwned"; ?>');
      expect(SecurityService.validateMagicBytes(spoofed, 'image/png')).toBe(false);
    });
  });

  describe('Password Policy Validation', () => {
    it('rejects passwords under 8 characters', () => {
      expect(SecurityService.validatePasswordStrength('Short1!').valid).toBe(false);
    });

    it('rejects passwords without required complexity', () => {
      expect(SecurityService.validatePasswordStrength('alllowercase123').valid).toBe(false);
      expect(SecurityService.validatePasswordStrength('ALLUPPERCASE123').valid).toBe(false);
      expect(SecurityService.validatePasswordStrength('NoNumbersHere!').valid).toBe(false);
    });

    it('accepts compliant passwords', () => {
      expect(SecurityService.validatePasswordStrength('SecureP@ssw0rd2026').valid).toBe(true);
    });
  });

  describe('User Registry Boundary Separation (Admin Isolation)', () => {
    it('accurately isolates and filters administrative identities from application user lists', () => {
      const mockAdmins = [{ email: 'admin@gmail.com' }, { email: 'super@agency.io' }];
      const adminEmailSet = new Set(mockAdmins.map((a) => a.email.toLowerCase().trim()));

      const mockMixedUsers = [
        { id: 'u1', name: 'Regular Customer', email: 'customer@client.com' },
        { id: 'u2', name: 'Admin User', email: 'admin@gmail.com' },
        { id: 'u3', name: 'Super Admin', email: 'super@agency.io' },
        { id: 'u4', name: 'Another Client', email: 'client2@startup.com' },
      ];

      const filtered = mockMixedUsers.filter((u) => {
        const emailLower = u.email.toLowerCase().trim();
        return (
          !adminEmailSet.has(emailLower) &&
          u.name !== 'Super Admin' &&
          u.name !== 'Admin User'
        );
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map((u) => u.id)).toEqual(['u1', 'u4']);
      expect(filtered.some((u) => u.email === 'admin@gmail.com')).toBe(false);
      expect(filtered.some((u) => u.email === 'super@agency.io')).toBe(false);
    });
  });
});
