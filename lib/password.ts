import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const SCRYPT_OPTIONS = {
  N: 32768,
  r: 8,
  p: 3,
  maxmem: 64 * 1024 * 1024,
};

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Use no more than ${MAX_PASSWORD_LENGTH} characters.`;
  }

  return null;
}

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_OPTIONS,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      }
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const validationError = validatePassword(password);

  if (validationError) {
    throw new Error(validationError);
  }

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt);

  return [
    "scrypt-v1",
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join(":");
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  const parts = storedHash.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [version, saltHex, keyHex] = parts;

  if (
    version !== "scrypt-v1" ||
    !/^[0-9a-f]{32}$/.test(saltHex) ||
    !/^[0-9a-f]{128}$/.test(keyHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await deriveKey(password, salt);

  return timingSafeEqual(expectedKey, actualKey);
}