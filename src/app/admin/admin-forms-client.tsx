"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FolderTree,
  Link as LinkIcon,
} from 'lucide-react';

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

  function DashboardCard({
    href,
    icon,
    title,
    description,
    badgeText,
    theme,
  }: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    badgeText?: string;
    theme: 'amber' | 'emerald';
  }) {
    const themeMap = {
      amber: 'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700',
    } as const;

    return (
      <Link
        href={href}
        className="block bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg hover:border-stone-300 transition-all group relative overflow-hidden min-h-[140px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${themeMap[theme]}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-stone-900">{title}</h3>
              <p className="text-xs text-stone-500 font-medium mt-1">{description}</p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
            {badgeText}
          </span>
        </div>
        <div className="mt-4 w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-stone-800 transition-colors">
          管理画面を開く
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
        {theme === 'amber' ? (
          <LinkIcon className="absolute -bottom-10 -right-10 w-28 h-28 text-stone-50 opacity-40 -rotate-12" />
        ) : (
          <FolderTree className="absolute -bottom-10 -right-10 w-28 h-28 text-stone-50 opacity-40 -rotate-12" />
        )}
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
