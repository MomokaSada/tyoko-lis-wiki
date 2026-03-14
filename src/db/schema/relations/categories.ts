import { relations } from 'drizzle-orm';
import { categories } from '../categories'; 
import { contentCategories } from '../contentCategories';
import { contentEditLogCategories } from '../contentEditLogCategories';

export const categoriesRelations = relations(categories, ({ one , many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: 'categoryHierarchy',
    }),
    children: many(categories, {
        relationName: 'categoryHierarchy',
    }),
    contentCategories: many(contentCategories),
    contentEditLogCategories: many(contentEditLogCategories),
}));
