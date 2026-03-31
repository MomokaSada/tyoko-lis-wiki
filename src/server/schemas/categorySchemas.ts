import { z } from 'zod';

const optionalParentIdSchema = z
  .union([z.coerce.number().int().positive(), z.literal(''), z.null(), z.undefined()])
  .transform((value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    return value;
  });

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'カテゴリ名を入力してください').max(255, 'カテゴリ名は255文字以内で入力してください'),
  parentId: optionalParentIdSchema,
});

export const updateCategorySchema = z.object({
  id: z.coerce.number().int().positive('カテゴリIDが不正です'),
  name: z.string().trim().min(1, 'カテゴリ名を入力してください').max(255, 'カテゴリ名は255文字以内で入力してください'),
  parentId: optionalParentIdSchema,
});
