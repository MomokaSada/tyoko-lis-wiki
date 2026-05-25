import { z } from 'zod';

export const banAccountSchema = z.object({
  userId: z.coerce.number().int().positive('ユーザーIDが不正です'),
});

export type BanAccountInput = z.infer<typeof banAccountSchema>;

export const banAccountByNameSchema = z.object({
  name: z.string().trim().min(1, 'アカウント名を入力してください').max(255, 'アカウント名が長すぎます'),
  reason: z.string().trim().min(1, 'BAN理由を入力してください').max(500, 'BAN理由は500文字以内で入力してください'),
});

export type BanAccountByNameInput = z.infer<typeof banAccountByNameSchema>;
