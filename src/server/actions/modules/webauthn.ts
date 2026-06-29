import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
export const RP_NAME = process.env.APPLICATION_NAME ?? 'Tyoko Li\'s Wiki';
export const RP_ID = process.env.NEXT_PUBLIC_RP_ID ?? 'localhost';
export const RP_ORIGIN = process.env.NEXT_PUBLIC_RP_ORIGIN ?? 'http://localhost:3000';

const VALID_TRANSPORTS = [
    "usb",
    "nfc",
    "ble",
    "cable",
    "hybrid",
    "internal",
    "smart-card",
] as const satisfies AuthenticatorTransportFuture[];

export function parseTransports(
  transports: string
): AuthenticatorTransportFuture[] {
  return transports
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is AuthenticatorTransportFuture =>
      VALID_TRANSPORTS.includes(t as AuthenticatorTransportFuture)
    );
}
