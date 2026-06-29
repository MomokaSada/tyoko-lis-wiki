import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { HEADER_CLIENT_IP } from '@/lib/auth/constants';

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

  const withoutZoneId = trimmed.replace(/%[0-9A-Za-z_.-]+$/, '');

  if (isIP(withoutZoneId)) {
    return withoutZoneId;
  }

  const withoutIpv4Port = withoutZoneId.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);

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
  const clientIp = headersList.get(HEADER_CLIENT_IP);
  const ip = normalizeCandidateIp(clientIp);

  if (!ip) {
    return null;
  }

  return {
    ip,
    browser: normalizeBrowser(headersList.get('user-agent')),
  };
}
