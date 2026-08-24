import { SecurityService } from '../security';

describe('SecurityService - Defensive Security & Validation', () => {
  describe('sanitizeFilename', () => {
    it('strips path traversal sequences and null bytes', () => {
      const malicious = '../../../../etc/passwd.txt';
      const sanitized = SecurityService.sanitizeFilename(malicious);
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
      expect(sanitized).toBe('etc_passwd.txt');
    });

    it('neutralizes null byte injection attempts', () => {
      const payload = 'shell.php\0.jpg';
      const sanitized = SecurityService.sanitizeFilename(payload);
      expect(sanitized).not.toContain('\0');
      expect(sanitized).toBe('shell_php.jpg');
    });

    it('limits filename length and replaces dangerous characters', () => {
      const longName = 'a'.repeat(200) + '$$$%%@!.png';
      const sanitized = SecurityService.sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(90);
      expect(sanitized.endsWith('.png')).toBe(true);
    });
  });

  describe('validateMagicBytes', () => {
    it('identifies authentic JPEG binary buffers', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(SecurityService.validateMagicBytes(jpegBuffer, 'image/jpeg')).toBe(true);
    });

    it('identifies authentic PNG binary buffers', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(SecurityService.validateMagicBytes(pngBuffer, 'image/png')).toBe(true);
    });

    it('rejects spoofed executable buffers disguised as images', () => {
      // MZ header for Windows Executable
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      expect(SecurityService.validateMagicBytes(exeBuffer, 'image/jpeg')).toBe(false);
      expect(SecurityService.validateMagicBytes(exeBuffer, 'image/png')).toBe(false);
    });
  });

  describe('escapeHtml & sanitizeHtml', () => {
    it('escapes HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const escaped = SecurityService.escapeHtml(input);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('strips dangerous script tags and inline event handlers from rich HTML', () => {
      const dirtyHtml = '<p>Hello <img src="x" onerror="alert(1)" /> World</p><script>evil()</script>';
      const cleaned = SecurityService.sanitizeHtml(dirtyHtml);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('onerror=');
      expect(cleaned).toContain('<p>Hello');
      expect(cleaned).toContain('World</p>');
    });

    it('strips javascript: pseudo-protocols from links', () => {
      const linkHtml = '<a href="javascript:stealTokens()">Click me</a>';
      const cleaned = SecurityService.sanitizeHtml(linkHtml);
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).toContain('href="#"');
    });
  });

  describe('validatePasswordStrength', () => {
    it('accepts strong compliant passwords', () => {
      const result = SecurityService.validatePasswordStrength('SecureP@ssw0rd2026');
      expect(result.valid).toBe(true);
    });

    it('rejects short passwords', () => {
      const result = SecurityService.validatePasswordStrength('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('rejects passwords without numbers or uppercase letters', () => {
      const result = SecurityService.validatePasswordStrength('alllowercasepassword');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });
  });
});
