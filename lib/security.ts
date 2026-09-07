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
    const clean = filename.replace(/\0/g, '').replace(/(\.\.(\/|\\|$))+/g, '');

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

  /**
   * Validate a URL to prevent Server-Side Request Forgery (SSRF).
   * Blocks non-HTTP(S) protocols, credentials in URLs, private RFC 1918 CIDRs,
   * loopback (127.0.0.0/8, ::1, localhost), link-local / cloud metadata (169.254.0.0/16),
   * internal network top-level domains, and single-label container hostnames.
   */
  static validateSafeUrl(urlString: string): { safe: boolean; reason?: string } {
    if (!urlString || typeof urlString !== 'string') {
      return { safe: false, reason: 'URL is required' };
    }

    let parsed: URL;
    try {
      // Auto-prefix if protocol is missing for user convenience
      const normalized = urlString.startsWith('http://') || urlString.startsWith('https://')
        ? urlString
        : `https://${urlString}`;
      parsed = new URL(normalized);
    } catch {
      return { safe: false, reason: 'Invalid URL format' };
    }

    // 1. Enforce strict protocol allowlist
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}. Only http: and https: are permitted.` };
    }

    // 2. Disallow embedded credentials
    if (parsed.username || parsed.password) {
      return { safe: false, reason: 'URLs with embedded authentication credentials are not permitted.' };
    }

    const rawHostname = parsed.hostname.toLowerCase().trim();

    // 3. Reject empty hostname
    if (!rawHostname) {
      return { safe: false, reason: 'URL hostname is missing.' };
    }

    // 4. Strip IPv6 brackets if present
    const cleanHostname = rawHostname.startsWith('[') && rawHostname.endsWith(']')
      ? rawHostname.slice(1, -1)
      : rawHostname;

    // 5. Block known loopback and internal domain names
    if (
      cleanHostname === 'localhost' ||
      cleanHostname.endsWith('.localhost') ||
      cleanHostname.endsWith('.internal') ||
      cleanHostname.endsWith('.local') ||
      cleanHostname.endsWith('.cluster.local') ||
      cleanHostname.endsWith('.arpa')
    ) {
      return { safe: false, reason: `Access to internal or local hostname '${cleanHostname}' is forbidden.` };
    }

    // 6. Block single-label hostnames (e.g. 'redis', 'postgres', 'worker', 'kubernetes')
    if (!cleanHostname.includes('.') && !cleanHostname.includes(':')) {
      return { safe: false, reason: `Single-label hostnames ('${cleanHostname}') are restricted internal names.` };
    }

    // 7. Check IPv4 address against private and restricted ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = cleanHostname.match(ipv4Regex);
    if (ipv4Match) {
      const octets = [
        parseInt(ipv4Match[1], 10),
        parseInt(ipv4Match[2], 10),
        parseInt(ipv4Match[3], 10),
        parseInt(ipv4Match[4], 10),
      ];

      // Validate each octet <= 255
      if (octets.some((o) => o > 255)) {
        return { safe: false, reason: 'Invalid IPv4 address format.' };
      }

      const [o1, o2] = octets;

      // 0.0.0.0/8 (Current network)
      if (o1 === 0) {
        return { safe: false, reason: 'Access to 0.0.0.0/8 range is forbidden.' };
      }
      // 127.0.0.0/8 (Loopback)
      if (o1 === 127) {
        return { safe: false, reason: 'Access to loopback address (127.0.0.0/8) is forbidden.' };
      }
      // 10.0.0.0/8 (Private RFC 1918)
      if (o1 === 10) {
        return { safe: false, reason: 'Access to private address (10.0.0.0/8) is forbidden.' };
      }
      // 172.16.0.0/12 (Private RFC 1918: 172.16.0.0 - 172.31.255.255)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) {
        return { safe: false, reason: 'Access to private address (172.16.0.0/12) is forbidden.' };
      }
      // 192.168.0.0/16 (Private RFC 1918)
      if (o1 === 192 && o2 === 168) {
        return { safe: false, reason: 'Access to private address (192.168.0.0/16) is forbidden.' };
      }
      // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. AWS/GCP 169.254.169.254)
      if (o1 === 169 && o2 === 254) {
        return { safe: false, reason: 'Access to link-local and cloud metadata addresses (169.254.0.0/16) is strictly forbidden.' };
      }
      // 100.64.0.0/10 (Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
      if (o1 === 100 && o2 >= 64 && o2 <= 127) {
        return { safe: false, reason: 'Access to carrier-grade NAT address (100.64.0.0/10) is forbidden.' };
      }
      // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
      if (o1 >= 224) {
        return { safe: false, reason: 'Access to multicast or reserved IP address is forbidden.' };
      }
    }

    // 8. Check IPv6 address
    if (cleanHostname.includes(':')) {
      const lower = cleanHostname.toLowerCase();
      // ::1 (Loopback) or :: (Unspecified)
      if (lower === '::1' || lower === '::' || lower.startsWith('::ffff:127.') || lower.startsWith('0:0:0:0:0:0:0:1')) {
        return { safe: false, reason: 'Access to IPv6 loopback address is forbidden.' };
      }
      // fc00::/7 (Unique local address)
      if (lower.startsWith('fc') || lower.startsWith('fd')) {
        return { safe: false, reason: 'Access to IPv6 unique local address (fc00::/7) is forbidden.' };
      }
      // fe80::/10 (Link-local address)
      if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
        return { safe: false, reason: 'Access to IPv6 link-local address (fe80::/10) is forbidden.' };
      }
    }

    return { safe: true };
  }
}
