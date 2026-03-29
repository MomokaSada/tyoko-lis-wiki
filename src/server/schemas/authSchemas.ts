import { z } from 'zod';
import { normalizeUsername } from '@/server/lib/dummyEmail';

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'ユーザー名は3文字以上で入力してください')
  .max(32, 'ユーザー名は32文字以内で入力してください')
  .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字・ハイフン・アンダースコアのみ利用できます')
  .transform(normalizeUsername);

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const registerSchema = z
  .object({
    session: z.uuid('不正な招待リンクです'),
    username: usernameSchema,
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
    type: z.enum(['admin', 'bot'], 'アカウント種別が不正です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
