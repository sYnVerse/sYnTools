/**
 * WireGuard Curve25519 key-pair generation (clean-room).
 *
 * Uses @noble/curves X25519 (MIT) per RFC 7748. Private keys are clamped the
 * way WireGuard expects before storage; public keys are X25519(basepoint).
 */
import { x25519 } from '@noble/curves/ed25519.js';
import { Base64 } from 'js-base64';

/** Clamp a 32-byte seed into a WireGuard/X25519 private key (RFC 7748). */
function clampPrivateKey(seed: Uint8Array): Uint8Array {
  const key = new Uint8Array(seed);
  key[0] &= 248;
  key[31] = (key[31] & 127) | 64;
  return key;
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function toPrivateKeyBytes(privateKey: Uint8Array | string): Uint8Array {
  return typeof privateKey === 'string' ? Base64.toUint8Array(privateKey) : privateKey;
}

export function generateKeyPair({
  privateKey = undefined,
  preSharedKey = false,
}: {
  privateKey: Uint8Array | string | undefined
  preSharedKey: boolean
}) {
  const privateKeyBytes = privateKey == null
    ? clampPrivateKey(randomBytes(32))
    : toPrivateKeyBytes(privateKey);

  const publicKeyBytes = x25519.getPublicKey(privateKeyBytes);

  return {
    publicKey: Base64.fromUint8Array(publicKeyBytes),
    privateKey: Base64.fromUint8Array(privateKeyBytes),
    preSharedKey: preSharedKey ? Base64.fromUint8Array(randomBytes(32)) : undefined,
  };
}
