import crypto from 'node:crypto';

/* ───────── Senhas: scrypt (N=2^15, r=8, p=1) com salt aleatório ───────── */
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password.normalize('NFKC'), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, 'base64');
  const key = crypto.scryptSync(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

/** Hash fixo usado quando o e-mail não existe, para igualar o tempo de resposta (anti-enumeração). */
export const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));

export function passwordProblems(pw: string, email?: string): string[] {
  const p: string[] = [];
  if (pw.length < 12) p.push('mínimo de 12 caracteres');
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) p.push('letras maiúsculas e minúsculas');
  if (!/\d/.test(pw)) p.push('ao menos um número');
  if (!/[^A-Za-z0-9]/.test(pw)) p.push('ao menos um símbolo');
  if (email && pw.toLowerCase().includes(email.split('@')[0].toLowerCase())) p.push('não pode conter o e-mail');
  return p;
}

/* ───────── Utilitários ───────── */
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function hmac(secret: string, data: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Pseudonimiza IP (LGPD): guardamos apenas um hash truncado com segredo. */
export function hashIp(ip: string, secret: string): string {
  return hmac(secret, `ip:${ip}`).slice(0, 22);
}

/* ───────── TOTP (RFC 6238) para autenticação em dois fatores ───────── */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(crypto.randomBytes(20));

export function totp(secret: string, t = Date.now(), step = 30): string {
  const counter = Math.floor(t / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
  return code;
}

export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const c = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  for (let w = -window; w <= window; w++) {
    if (safeEqual(totp(secret, Date.now() + w * 30_000), c)) return true;
  }
  return false;
}
