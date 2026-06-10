export const RP_NAME = process.env.APPLICATION_NAME ?? 'Tyoko Li\'s Wiki';
export const RP_ID = process.env.NEXT_PUBLIC_RP_ID ?? 'localhost';
export const RP_ORIGIN = process.env.NEXT_PUBLIC_RP_ORIGIN ?? 'http://localhost:3000';

export function parseTransports(
  transports: string
): string[] {
  return transports
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
