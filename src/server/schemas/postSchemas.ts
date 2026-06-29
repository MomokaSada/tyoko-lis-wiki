import { z } from 'zod';

export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
});

export const postCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});
