import { z } from 'zod';

export const banAccountSchema = z.object({
  userId: z.coerce.number().int().positive('ユーザーIDが不正です'),
});

export type BanAccountInput = z.infer<typeof banAccountSchema>;
