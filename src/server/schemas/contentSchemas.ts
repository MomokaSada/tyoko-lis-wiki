import { z } from 'zod';
import { slugify } from '@/server/lib/slug';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'スラッグを入力してください')
  .max(255, 'スラッグは255文字以内で入力してください')
  .regex(/^[a-z0-9-]+$/, 'スラッグは英小文字・数字・ハイフンのみ利用できます');

const optionalParentIdSchema = z
  .union([z.coerce.number().int().positive(), z.literal(''), z.null(), z.undefined()])
  .transform((value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    return value;
  });

const taxonomySelectionSchema = z.object({
  tagIds: z.array(z.coerce.number().int().positive()).default([]),
  newTags: z.string().trim().max(1000, '新規タグ入力が長すぎます').default(''),
  categoryIds: z.array(z.coerce.number().int().positive()).default([]),
  newCategoryName: z.string().trim().max(255, '新規カテゴリ名は255文字以内で入力してください').default(''),
  newCategoryParentId: optionalParentIdSchema,
});

export const createContentSchema = z.object({
  session: z.string().optional().nullable(),
  title: z.string().trim().min(1, 'タイトルを入力してください').max(255, 'タイトルは255文字以内で入力してください'),
  slug: z
    .string()
    .trim()
    .max(255, 'スラッグは255文字以内で入力してください')
    .transform((value) => value || '')
    .optional(),
  content: z.string().trim().min(1, '本文を入力してください'),
  thumbnail: z.string().trim().url('サムネイルURLは正しいURL形式で入力してください'),
  isPublished: z.boolean(),
}).and(taxonomySelectionSchema);

export type CreateContentInputRaw = z.input<typeof createContentSchema>;

export type CreateContentInput = {
  session: string | null;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  isPublished: boolean;
  tagIds: number[];
  newTags: string;
  categoryIds: number[];
  newCategoryName: string;
  newCategoryParentId: number | null;
};

export function normalizeCreateContentInput(input: z.infer<typeof createContentSchema>): CreateContentInput {
  const normalizedSlug = input.slug ? slugify(input.slug) : slugify(input.title);

  return {
    session: input.session ?? null,
    title: input.title,
    slug: normalizedSlug,
    content: input.content,
    thumbnail: input.thumbnail,
    isPublished: input.isPublished,
    tagIds: input.tagIds,
    newTags: input.newTags,
    categoryIds: input.categoryIds,
    newCategoryName: input.newCategoryName,
    newCategoryParentId: input.newCategoryParentId,
  };
}

export const updateContentSchema = z.object({
  session: z.string().optional().nullable(),
  contentId: z.coerce.number().int().positive('記事IDが不正です'),
  title: z.string().trim().min(1, 'タイトルを入力してください').max(255, 'タイトルは255文字以内で入力してください'),
  slug: slugSchema,
  content: z.string().trim().min(1, '本文を入力してください'),
  thumbnail: z.string().trim().url('サムネイルURLは正しいURL形式で入力してください'),
  isPublished: z.boolean(),
}).and(taxonomySelectionSchema);

export type UpdateContentInput = z.infer<typeof updateContentSchema>;

export const deleteContentSchema = z.object({
  contentId: z.coerce.number().int().positive('記事IDが不正です'),
});

export type DeleteContentInput = z.infer<typeof deleteContentSchema>;
