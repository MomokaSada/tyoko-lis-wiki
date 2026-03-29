import { z } from 'zod';

export const createAccountCreateLinkSchema = z.object({
  expiresInMinutes: z.coerce
    .number()
    .int()
    .min(5, '有効期限は5分以上にしてください')
    .max(60 * 24 * 7, '有効期限は7日以内にしてください'),
});

export type CreateAccountCreateLinkInput = z.infer<
    typeof createAccountCreateLinkSchema
>;

export const deactivateAccountCreateLinkSchema = z.object({
  uuid: z.uuid('不正なリンクIDです'),
});

export type DeactivateAccountCreateLinkInput = z.infer<
  typeof deactivateAccountCreateLinkSchema
>;
