import { relations } from 'drizzle-orm';
import { contents } from '../contents';
import { contentEditLogs } from '../contentEditLogs';
import { tags } from '../tags';
import { categories } from '../categories';
import { contentTags } from '../contentTags';
import { contentEditLogTags } from '../contentEditLogTags';
import { contentCategories } from '../contentCategories';
import { contentEditLogCategories } from '../contentEditLogCategories';

export const contentTagsRelations = relations(contentTags, ({ one }) => ({
    content: one(contents,{
        fields: [contentTags.contentId],
        references: [contents.id],
    }),
    tag: one(tags, {
        fields: [contentTags.tagId],
        references: [tags.id],
    })
}));

export const contentEditLogTagsRelations = relations(contentEditLogTags, ({ one }) => ({
    contentEditLog: one(contentEditLogs,{
        fields: [contentEditLogTags.editLogId],
        references: [contentEditLogs.id],
    }),
    tag: one(tags, {
        fields: [contentEditLogTags.tagId],
        references: [tags.id],
    })
}));

export const contentCategoriesRelations = relations(contentCategories, ({ one }) => ({
    content: one(contents,{
        fields: [contentCategories.contentId],
        references: [contents.id],
    }),
    category: one(categories, {
        fields: [contentCategories.categoryId],
        references: [categories.id],
    })
}));

export const contentEditLogCategoriesRelations = relations(contentEditLogCategories, ({ one }) => ({
    contentEditLog: one(contentEditLogs,{
        fields: [contentEditLogCategories.editLogId],
        references: [contentEditLogs.id],
    }),
    category: one(categories, {
        fields: [contentEditLogCategories.categoryId],
        references: [categories.id],
    })
}));