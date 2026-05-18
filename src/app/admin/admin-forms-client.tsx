"use client";

import { useMemo } from 'react';
import {
  FolderTree,
  Link as LinkIcon,
} from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';

type EditLinkSession = {
  uuid: string;
  authorId: number;
  authorName: string | null;
  maxEdits: number;
  editsUsed: number;
  isActive: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  status: 'active' | 'expired' | 'inactive' | 'limit-reached';
};

type CategoryOption = {
  id: number;
  name: string;
  parentId: number | null;
  label: string;
};

type TaxonomyOptions = {
  tags: any[];
  categories: CategoryOption[];
};

interface AdminFormsClientProps {
  editLinks: EditLinkSession[];
  taxonomy: TaxonomyOptions;
}

export function AdminFormsClient({ editLinks, taxonomy }: AdminFormsClientProps) {
  const editLinksCountText = useMemo(() => `${editLinks.length}件`, [editLinks.length]);
  const categoriesCountText = useMemo(
    () => `${taxonomy.categories.length}件`,
    [taxonomy.categories.length]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard
        href="/admin/edit-links"
        icon={<LinkIcon />}
        title="編集リンク管理"
        description="編集用の一時リンクを発行し、利用状況を管理します。"
        badgeText={editLinksCountText}
        theme="amber"
      />

      <DashboardCard
        href="/admin/categories"
        icon={<FolderTree />}
        title="カテゴリ管理"
        description="記事の分類構造（親カテゴリ・子カテゴリ）を編集します。"
        badgeText={categoriesCountText}
        theme="emerald"
      />
    </div>
  );
}
