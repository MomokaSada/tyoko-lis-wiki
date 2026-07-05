import { createHash } from 'crypto';
import { findUserByBotTokenHash } from '@/server/repositories/userRepository';

export type ResolveBotActor = {
  id: number;
  name: string;
  role: 'bot';
};

export async function resolveBotActor(
  token: string
): Promise<ResolveBotActor | null> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const user = await findUserByBotTokenHash(tokenHash);
  if (!user || !user.isActive || user.role !== 'bot') {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    role: 'bot',
  };
}