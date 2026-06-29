import { pgEnum } from 'drizzle-orm/pg-core';
import { USER_TYPES, SNAPSHOT_TYPES, PURPOSE_TYPES } from '@/lib/enums';

export const userTypeEnum = pgEnum('user_type', USER_TYPES);
export const snapshotTypeEnum = pgEnum('snapshot_type', SNAPSHOT_TYPES);
export const purposeTypeEnum = pgEnum('purpose_type', PURPOSE_TYPES);