import { pgEnum } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['owner', 'admin', 'bot']);
export const snapshotTypeEnum = pgEnum('snapshot_type', ['snapshot', 'diff']);
export const purposeTypeEnum = pgEnum('purpose_type',['register','login'])