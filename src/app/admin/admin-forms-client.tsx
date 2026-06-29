"use client";

import { useMemo } from 'react';
import {
  FolderTree,
  Link as LinkIcon,
} from 'lucide-react';
import { DashboardCard } from '@/components/features/admin/DashboardCard';

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
    <>
      <DashboardCard
        href="/admin/edit-links"
        icon={<LinkIcon className="w-5 h-5" />}
        title="編集リンク管理"
        description="発行・確認"
        badgeText={editLinksCountText}
        theme="amber"
      />

      <DashboardCard
        href="/admin/categories"
        icon={<FolderTree className="w-5 h-5" />}
        title="カテゴリ管理"
        description="追加・更新"
        badgeText={categoriesCountText}
        theme="emerald"
      />
    </>
  );
}
