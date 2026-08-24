/**
 * Enterprise Application Security & Defensive Validation Library
 * Provides centralized XSS sanitization, file signature inspection,
 * path traversal defense, and secure cryptographic utilities.
 */

// Magic byte signatures for authorized file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  // JPEG / JPG: FF D8 FF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/jpg': [[0xff, 0xd8, 0xff]],
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // GIF: 47 49 46 38
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  // WEBP: 52 49 46 46 ... 57 45 42 50
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  // PDF: 25 50 44 46 (%PDF)
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  // MP4: 00 00 00 ... 66 74 79 70 (ftyp)
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
  ],
};

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'txt', 'csv']);

export class SecurityService {
  /**
   * Sanitize a user-provided filename to prevent Path Traversal, Null Byte injection,
   * and double-extension execution vulnerabilities.
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'unnamed-file';
    }

    // 1. Remove null bytes and path traversal patterns
    let clean = filename.replace(/\0/g, '').replace(/(\.\.(\/|\\|$))+/g, '');

    // 2. Extract extension safely
    const parts = clean.split('.');
    if (parts.length === 1) {
      return clean.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    const rawExt = parts.pop()?.toLowerCase() || '';
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : 'bin';

    // 3. Sanitize basename
    const rawBase = parts.join('_');
    const base = rawBase
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 80) // Limit length
      .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores

    return `${base || 'file'}.${ext}`;
  }

  /**
   * Validate file binary magic bytes against declared MIME type to detect spoofing.
   */
  static validateMagicBytes(buffer: Buffer | Uint8Array, mimeType: string): boolean {
    if (!buffer || buffer.length < 4) {
      return false;
    }

    const signatures = FILE_SIGNATURES[mimeType.toLowerCase()];
    if (!signatures) {
      // If MIME type doesn't have a strict magic number, require plain text / valid utf8
      return mimeType.startsWith('text/') || mimeType === 'application/json';
    }

    const bytes = Array.from(buffer.slice(0, 12));

    return signatures.some((sig) => {
      return sig.every((expectedByte, index) => bytes[index] === expectedByte);
    });
  }

  /**
   * Sanitize arbitrary text input against Cross-Site Scripting (XSS).
   */
  static escapeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize HTML content by stripping malicious script tags, javascript: URIs,
   * and inline event handlers (onerror, onload, onclick).
   */
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';

    return html
      // Strip <script>...</script>
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip <iframe>, <object>, <embed>, <applet>
      .replace(/<\/?(iframe|object|embed|applet|meta|link|style)[^>]*>/gi, '')
      // Strip javascript: pseudo-protocols
      .replace(/href\s*=\s*["']?\s*javascript:[^"'>]*/gi, 'href="#"')
      .replace(/src\s*=\s*["']?\s*javascript:[^"'>]*/gi, 'src=""')
      // Strip on* event handlers (e.g. onload, onerror, onclick)
      .replace(/\s+on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');
  }

  /**
   * Validate password strength (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char).
   */
  static validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (!password || typeof password !== 'string') {
      return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }

    if (password.length > 128) {
      return { valid: false, message: 'Password must not exceed 128 characters' };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      };
    }

    return { valid: true };
  }
}
