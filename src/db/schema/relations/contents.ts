import { relations } from 'drizzle-orm';
import { contents } from '../contents';
import { contentEditLogs } from '../contentEditLogs';
import { contentTags } from '../contentTags';
import { contentCategories } from '../contentCategories';

export const contentsRelations = relations(contents, ({ many }) => ({
    contentEditLogs: many(contentEditLogs),
    contentTags: many(contentTags),
    contentCategories: many(contentCategories),
}));
