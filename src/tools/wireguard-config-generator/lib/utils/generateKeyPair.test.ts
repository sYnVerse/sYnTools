import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { Base64 } from 'js-base64';
import { generateKeyPair } from './generateKeyPair';

/** RFC 7748 §6.1 — Alice */
const ALICE_PRIVATE_HEX = '77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a';
const ALICE_PUBLIC_HEX = '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a';

/** RFC 7748 §6.1 — Bob */
const BOB_PRIVATE_HEX = '5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb';
const BOB_PUBLIC_HEX = 'de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f';

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

function isValidWireGuardKey(b64: string): boolean {
  if (!/^[A-Za-z0-9+/]{43}=$/.test(b64)) {
    return false;
  }
  const raw = Base64.toUint8Array(b64);
  return raw.length === 32;
}

describe('wireguard generateKeyPair', () => {
  it('matches RFC 7748 §6.1 Alice and Bob public keys', () => {
    const alice = generateKeyPair({
      privateKey: hexToBytes(ALICE_PRIVATE_HEX),
      preSharedKey: false,
    });
    const bob = generateKeyPair({
      privateKey: hexToBytes(BOB_PRIVATE_HEX),
      preSharedKey: false,
    });

    expect(bytesToHex(Base64.toUint8Array(alice.publicKey))).toBe(ALICE_PUBLIC_HEX);
    expect(bytesToHex(Base64.toUint8Array(bob.publicKey))).toBe(BOB_PUBLIC_HEX);
    expect(bytesToHex(Base64.toUint8Array(alice.privateKey))).toBe(ALICE_PRIVATE_HEX);
    expect(bytesToHex(Base64.toUint8Array(bob.privateKey))).toBe(BOB_PRIVATE_HEX);
  });

  it('accepts base64 private keys and returns valid 32-byte base64 key material', () => {
    const fromHex = generateKeyPair({
      privateKey: hexToBytes(ALICE_PRIVATE_HEX),
      preSharedKey: false,
    });
    const fromB64 = generateKeyPair({
      privateKey: fromHex.privateKey,
      preSharedKey: true,
    });

    expect(fromB64.publicKey).toBe(fromHex.publicKey);
    expect(isValidWireGuardKey(fromB64.publicKey)).toBe(true);
    expect(isValidWireGuardKey(fromB64.privateKey)).toBe(true);
    expect(fromB64.preSharedKey).toBeDefined();
    expect(isValidWireGuardKey(fromB64.preSharedKey!)).toBe(true);
  });

  it('generates random clamped private keys with matching public keys', () => {
    const a = generateKeyPair({ privateKey: undefined, preSharedKey: false });
    const b = generateKeyPair({ privateKey: undefined, preSharedKey: false });

    expect(a.privateKey).not.toBe(b.privateKey);
    expect(isValidWireGuardKey(a.privateKey)).toBe(true);
    expect(isValidWireGuardKey(a.publicKey)).toBe(true);

    const priv = Base64.toUint8Array(a.privateKey);
    expect(priv[0] & 7).toBe(0);
    expect(priv[31] & 128).toBe(0);
    expect(priv[31] & 64).toBe(64);

    const recomputed = generateKeyPair({ privateKey: a.privateKey, preSharedKey: false });
    expect(recomputed.publicKey).toBe(a.publicKey);
  });

  it('cross-checks Alice public key against wg pubkey when available', () => {
    const wgCheck = spawnSync('wg', ['help'], { encoding: 'utf8' });
    if (wgCheck.error || (wgCheck.status !== 0 && wgCheck.status !== 1)) {
      // wireguard-tools not installed — skip without failing the suite
      return;
    }

    const alice = generateKeyPair({
      privateKey: hexToBytes(ALICE_PRIVATE_HEX),
      preSharedKey: false,
    });
    const result = spawnSync('wg', ['pubkey'], {
      input: alice.privateKey,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(alice.publicKey);
  });
});
