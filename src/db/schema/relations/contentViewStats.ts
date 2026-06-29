import { relations } from 'drizzle-orm';
import { contents } from '../contents';
import { contentViewStats } from '../contentViewStats';

export const contentViewStatsRelations = relations(contentViewStats, ({ one }) => ({
    content: one(contents, {
        fields: [contentViewStats.contentId],
        references: [contents.id],
    }),
}));
