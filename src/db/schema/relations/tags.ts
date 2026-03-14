import { relations } from 'drizzle-orm';
import { tags } from '../tags'; 
import { contentTags } from '../contentTags';
import { contentEditLogTags } from '../contentEditLogTags';

export const tagsRelations = relations(tags, ({ many }) => ({
    contentTags: many(contentTags),
    contentEditLogTags: many(contentEditLogTags),
}));
