import { z } from 'zod';

export const optionalParentIdSchema = z
  .union([z.coerce.number().int().positive(), z.literal(''), z.null(), z.undefined()])
  .transform((value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    return value;
  });