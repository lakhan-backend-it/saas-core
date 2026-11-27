import { createHash, randomBytes } from 'crypto';

/** Opaque refresh token (sent to client once). */
export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/** Store only hashes — never persist raw refresh tokens. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
