import { isIP } from 'node:net';
import { z } from 'zod';

export const createIpBanSchema = z.object({
  ip: z.string().trim().refine((value) => isIP(value) !== 0, 'IPアドレス形式が不正です'),
  browser: z.string().trim().min(1, 'ブラウザ名を入力してください').max(512, 'ブラウザ名は512文字以内で入力してください'),
  reason: z.string().trim().min(1, 'BAN理由を入力してください').max(255, 'BAN理由は255文字以内で入力してください'),
});

export type CreateIpBanInput = z.infer<typeof createIpBanSchema>;

/** アクセス記録の deviceId から BAN する（手入力不要、誤BAN防止） */
export const createDeviceBanSchema = z.object({
  deviceId: z.coerce.number().int().positive('デバイスIDが不正です'),
  reason: z.string().trim().min(1, 'BAN理由を入力してください').max(255, 'BAN理由は255文字以内で入力してください'),
});

export type CreateDeviceBanInput = z.infer<typeof createDeviceBanSchema>;

export const deactivateIpBanSchema = z.object({
  banId: z.coerce.number().int().positive('BAN IDが不正です'),
});

export type DeactivateIpBanInput = z.infer<typeof deactivateIpBanSchema>;
