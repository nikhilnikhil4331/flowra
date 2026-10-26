/**
 * Local account + session helpers.
 *
 * The app ships with no backend credentials, so accounts are created and
 * verified **on this device** with the Web Crypto API: the password is stretched
 * with PBKDF2-SHA-256 (120k iterations, random 16-byte salt) and only the salt +
 * digest are persisted. Nothing leaves the browser, no plaintext password is
 * ever stored, and OAuth providers are never faked — see SocialRow.
 */

const ITERATIONS = 120_000;

export type StoredAccount = {
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
};

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function newSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toHex(bits);
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailProblem(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'That email doesn’t look right.';
  return null;
}

export function passwordProblem(password: string): string | null {
  if (!password) return 'Choose a password.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return 'Mix letters and numbers so it stays safe.';
  return null;
}

export function nameProblem(name: string): string | null {
  if (!name.trim()) return 'Enter your name.';
  if (name.trim().length < 2) return 'That name is too short.';
  return null;
}
