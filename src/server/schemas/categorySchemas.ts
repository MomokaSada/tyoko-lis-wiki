import { z } from 'zod';
import { optionalParentIdSchema } from './modules/optionalParentId';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'カテゴリ名を入力してください').max(255, 'カテゴリ名は255文字以内で入力してください'),
  parentId: optionalParentIdSchema,
});

export const updateCategorySchema = z.object({
  id: z.coerce.number().int().positive('カテゴリIDが不正です'),
  name: z.string().trim().min(1, 'カテゴリ名を入力してください').max(255, 'カテゴリ名は255文字以内で入力してください'),
  parentId: optionalParentIdSchema,
});
