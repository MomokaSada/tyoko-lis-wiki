import { getCurrentActor } from '@/server/lib/currentActor';
import { getTaxonomyOptionsPaginated } from '@/server/services/taxonomyService';
import { CategoryCreateForm } from './category-create-form';
import { CategoryTreeClient } from './category-tree-client';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { parseListQuery } from '@/types/listQuery';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';

type CategoryItem = {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryItem[];
};

function buildTree(categories: CategoryItem[]): CategoryItem[] {
  const map = new Map<number, CategoryItem>();
  const roots: CategoryItem[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default async function CategoriesAdminPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();
  const query = parseListQuery(searchParams, ['name'], 'name', 'asc');
  const taxonomy = await getTaxonomyOptionsPaginated(query);

  const totalPages = Math.max(1, Math.ceil(taxonomy.totalCount / query.limit));
  const currentPage = query.page;
  const currentSort = query.sortBy ?? 'name';
  const currentOrder = query.sortOrder ?? 'asc';
  const currentQ = query.searchQuery ?? '';

  function pageUrl(page: number): string {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    if (currentSort !== 'name') params.set('sort', currentSort);
    if (currentOrder !== 'asc') params.set('order', currentOrder);
    params.set('page', String(page));
    return `?${params.toString()}`;
  }

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  // ツリーを構築するためのフラットリストを決定
  // 検索時は「一致したカテゴリ + その祖先」のみを含める
  let visibleCategoryIds: Set<number> | null = null;
  if (currentQ && taxonomy.matchedCategoryIds) {
    visibleCategoryIds = new Set(taxonomy.matchedCategoryIds);
    // 一致カテゴリの祖先を収集（階層を保つため）
    const allMap = new Map(taxonomy.allCategories.map((c) => [c.id, c]));
    for (const id of taxonomy.matchedCategoryIds) {
      let current = allMap.get(id);
      while (current?.parentId) {
        visibleCategoryIds.add(current.parentId);
        current = allMap.get(current.parentId);
      }
    }
  }

  const sourceCategories = visibleCategoryIds
    ? taxonomy.allCategories.filter((cat) => visibleCategoryIds!.has(cat.id))
    : taxonomy.allCategories;

  const flatCategories: CategoryItem[] = sourceCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    parentId: cat.parentId ?? null,
    children: [],
  }));
  const tree = buildTree(flatCategories);

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <svg className="w-16 h-16 text-emerald-400/30 ml-6 mt-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">カテゴリ管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">Wikiのカテゴリの体系的追加・更新</p>
            </div>
          </div>
        </div>

        {/* セクション1: カテゴリ作成 */}
        <div className="animate-float-in relative z-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">カテゴリ作成</h2>
          </div>
          <p className="text-stone-500 text-sm mb-6 pl-4">親カテゴリを指定すると階層構造になります。編集は一覧から行えます。</p>

          <div className="card" style={{ overflow: 'visible' }}>
            <div className="card-body">
              <div className="space-y-6">
                <CategoryCreateForm
                  categories={taxonomy.allCategories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    parentId: category.parentId ?? null,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* セクション2: カテゴリ一覧（ツリー構造） */}
        <div className="animate-float-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">カテゴリ一覧（ツリー構造）</h2>
          </div>
          <p className="text-stone-500 text-sm mb-6 pl-4">各行の「関連」ボタンで親子関係を確認、「編集」ボタンでモーダルから編集できます。</p>

          <div className="card">
            {/* ツールバー */}
            <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <form method="GET" action="/admin/categories" className="contents">
                <input type="hidden" name="page" value="1" />
                <div className="search-box">
                  <svg className="search-box-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  <input type="search" name="q" defaultValue={currentQ} placeholder="カテゴリを検索..." className="search-box-input" />
                </div>
              </form>
              <Link
                href="#create-form"
                className="btn-primary btn-sm"
                style={{ background: '#f59e0b', color: 'white', fontWeight: 700, borderRadius: '0.625rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                新規作成
              </Link>
            </div>

            {/* テーブル（ツリー構造） - Client Component */}
            <CategoryTreeClient
              tree={tree}
              allCategories={taxonomy.allCategories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                parentId: cat.parentId ?? null,
              }))}
            />

            {/* フッター: 総件数 + ページネーション */}
            <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{taxonomy.allCategories.length}</strong> 件</span>
              {currentQ && (
                <span className="text-sm text-stone-400 ml-4">
                  （検索中: <strong>{currentQ}</strong> / 該当 <strong className="text-stone-700">{taxonomy.totalCount}</strong> 件）
                </span>
              )}
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} pageUrl={pageUrl} />}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/admin" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
            ← 管理画面に戻る
          </Link>
        </div>
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
