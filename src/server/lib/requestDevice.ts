import { isIP } from 'node:net';
import { headers } from 'next/headers';

const BROWSER_MAX_LENGTH = 512;

export type RequestDeviceInfo = {
  ip: string;
  browser: string;
};

function normalizeCandidateIp(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  if (!trimmed) {
    return null;
  }

  if (isIP(trimmed)) {
    return trimmed;
  }

  const withoutIpv4Port = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);

  if (withoutIpv4Port && isIP(withoutIpv4Port[1])) {
    return withoutIpv4Port[1];
  }

  return null;
}

function normalizeBrowser(userAgent: string | null) {
  const value = userAgent?.trim();

  if (!value) {
    return 'unknown';
  }

  return value.slice(0, BROWSER_MAX_LENGTH);
}

export async function getCurrentRequestDevice(): Promise<RequestDeviceInfo | null> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const candidateIps = [
    ...(forwardedFor ? forwardedFor.split(',') : []),
    realIp,
  ];

  const ip = candidateIps
    .map((candidate) => normalizeCandidateIp(candidate))
    .find((candidate): candidate is string => Boolean(candidate));

  if (!ip) {
    return null;
  }

  return {
    ip,
    browser: normalizeBrowser(headersList.get('user-agent')),
  };
}
