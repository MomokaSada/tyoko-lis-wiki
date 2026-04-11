"use client";

import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Link as LinkIcon,
} from 'lucide-react';
import { CategoryCreateForm } from './categories/category-create-form';
import { CategoryUpdateForm } from './categories/category-update-form';
import { EditLinkForm } from './edit-links/edit-link-form';

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
  const [openSection, setOpenSection] = useState<'edit' | 'category' | null>(null);
  const editSectionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  const [editLinksPage, setEditLinksPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const EDIT_LINKS_PAGE_SIZE = 10;
  const CATEGORIES_PAGE_SIZE = 10;

  const editLinksCountText = useMemo(() => `${editLinks.length}件`, [editLinks.length]);
  const categoriesCountText = useMemo(
    () => `${taxonomy.categories.length}件`,
    [taxonomy.categories.length]
  );

  const editLinksTotalPages = Math.max(1, Math.ceil(editLinks.length / EDIT_LINKS_PAGE_SIZE));
  const categoriesTotalPages = Math.max(
    1,
    Math.ceil(taxonomy.categories.length / CATEGORIES_PAGE_SIZE)
  );

  const pagedEditLinks = useMemo(() => {
    const start = (editLinksPage - 1) * EDIT_LINKS_PAGE_SIZE;
    return editLinks.slice(start, start + EDIT_LINKS_PAGE_SIZE);
  }, [editLinks, editLinksPage]);

  const pagedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * CATEGORIES_PAGE_SIZE;
    return taxonomy.categories.slice(start, start + CATEGORIES_PAGE_SIZE);
  }, [taxonomy.categories, categoriesPage]);

  function toggleAndScrollTo(section: 'edit' | 'category') {
    const isOpen = openSection === section;
    const next = isOpen ? null : section;
    setOpenSection(next);

    if (next === 'edit') setEditLinksPage(1);
    if (next === 'category') setCategoriesPage(1);

    if (next === 'edit') {
      requestAnimationFrame(() =>
        editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
    if (next === 'category') {
      requestAnimationFrame(() =>
        categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
  }

  function Pagination({
    page,
    totalPages,
    onChange,
  }: {
    page: number;
    totalPages: number;
    onChange: (next: number) => void;
  }) {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
        <div className="text-xs font-bold text-stone-500">
          {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> 前へ
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  function getStatusBadge(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 有効
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> 期限切れ
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-500" /> 無効
          </span>
        );
      case 'limit-reached':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> 回数上限
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => toggleAndScrollTo('edit')}
          className="text-left bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg transition-all group relative overflow-hidden min-h-[140px]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800 leading-tight">編集リンク管理</h3>
                <p className="text-xs text-stone-500 font-medium mt-1">発行・確認</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
              {editLinksCountText}
            </span>
          </div>
          <div className="mt-4 w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-stone-800 transition-colors">
            <ArrowDown
              className={`w-4 h-4 transition-transform ${openSection === 'edit' ? 'rotate-180' : 'rotate-0'}`}
            />{' '}
            {openSection === 'edit' ? '閉じる' : '開く'}
          </div>
          <LinkIcon className="absolute -bottom-10 -right-10 w-28 h-28 text-stone-50 opacity-40 -rotate-12" />
        </button>

        <button
          type="button"
          onClick={() => toggleAndScrollTo('category')}
          className="text-left bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg transition-all group relative overflow-hidden min-h-[140px]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800 leading-tight">カテゴリ管理</h3>
                <p className="text-xs text-stone-500 font-medium mt-1">追加・更新</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
              {categoriesCountText}
            </span>
          </div>
          <div className="mt-4 w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-stone-800 transition-colors">
            <ArrowDown
              className={`w-4 h-4 transition-transform ${openSection === 'category' ? 'rotate-180' : 'rotate-0'}`}
            />{' '}
            {openSection === 'category' ? '閉じる' : '開く'}
          </div>
          <FolderTree className="absolute -bottom-10 -right-10 w-28 h-28 text-stone-50 opacity-40 -rotate-12" />
        </button>
      </div>

      {openSection === 'edit' && (
        <div
          ref={editSectionRef}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="font-bold text-stone-800 mb-2">新しい編集リンクを発行</h3>
            <p className="text-sm text-stone-500 mb-4">記事編集用の一時セッションリンクを作成します</p>
            <EditLinkForm />
          </div>

          {editLinks.length > 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h4 className="font-bold text-stone-800 mb-4">発行済み編集リンク一覧</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {pagedEditLinks.map((link) => (
                  <div
                    key={link.uuid}
                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-stone-700 truncate" title={link.uuid}>
                          {link.uuid}
                        </div>
                        <div className="mt-2">{getStatusBadge(link.status)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-stone-400 font-bold">使用状況</div>
                        <div className="text-sm font-black text-stone-800">
                          {link.editsUsed}/{link.maxEdits}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">開始</div>
                        <div className="font-bold text-stone-700">
                          {link.startAt.toISOString().split('T')[0]}
                        </div>
                      </div>
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">終了</div>
                        <div className="font-bold text-stone-700">
                          {link.endAt.toISOString().split('T')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-stone-500 font-medium truncate">
                      作成者: {link.authorName ?? `user:${link.authorId}`}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={editLinksPage}
                totalPages={editLinksTotalPages}
                onChange={(next) => setEditLinksPage(next)}
              />
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-stone-500 text-center py-4">まだ発行された編集リンクはありません。</p>
            </div>
          )}
        </div>
      )}

      {openSection === 'category' && (
        <div
          ref={categorySectionRef}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="font-bold text-stone-800 mb-2">新規カテゴリ作成</h3>
            <p className="text-sm text-stone-500 mb-4">記事のカテゴリを追加します</p>
            <CategoryCreateForm
              categories={taxonomy.categories.map((category) => ({
                id: category.id,
                label: category.label,
              }))}
            />
          </div>

          {taxonomy.categories.length > 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h4 className="font-bold text-stone-800 mb-4">既存カテゴリ一覧</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pagedCategories.map((category) => (
                  <div key={category.id} className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                    <CategoryUpdateForm
                      category={category}
                      categories={taxonomy.categories.map((option) => ({
                        id: option.id,
                        label: option.label,
                      }))}
                    />
                  </div>
                ))}
              </div>
              <Pagination
                page={categoriesPage}
                totalPages={categoriesTotalPages}
                onChange={(next) => setCategoriesPage(next)}
              />
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-stone-500 text-center py-4">カテゴリはまだありません。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
