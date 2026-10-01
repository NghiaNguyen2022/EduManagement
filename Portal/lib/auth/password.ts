const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;

export type PasswordHash = {
  salt: string;
  hash: string;
  iterations: number;
};

export async function hashPassword(password: string): Promise<PasswordHash> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const hash = await deriveHash(password, saltBytes, PBKDF2_ITERATIONS);
  return { salt: toHex(saltBytes), hash, iterations: PBKDF2_ITERATIONS };
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string,
  iterations: number,
): Promise<boolean> {
  const computed = await deriveHash(password, fromHex(salt), iterations);
  return timingSafeEqual(computed, hash);
}

async function deriveHash(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const safeSalt = new Uint8Array(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: safeSalt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return toHex(new Uint8Array(derivedBits));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
