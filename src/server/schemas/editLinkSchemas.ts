import { z } from 'zod';

export const createEditLinkSchema = z.object({
  expiresInMinutes: z.coerce
    .number()
    .int()
    .min(5, '有効期限は5分以上にしてください')
    .max(60 * 24 * 7, '有効期限は7日以内にしてください'),
  maxEdits: z.coerce
    .number()
    .int()
    .min(1, '編集可能回数は1回以上にしてください')
    .max(500, '編集可能回数は500回以内にしてください'),
});

export type CreateEditLinkInput = z.infer<typeof createEditLinkSchema>;
