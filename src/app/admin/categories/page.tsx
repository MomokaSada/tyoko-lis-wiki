import { Fragment } from 'react';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getTaxonomyOptions } from '@/server/services/contentService';
import { CategoryCreateForm } from './category-create-form';
import { CategoryUpdateForm } from './category-update-form';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';

type CategoryItem = {
  id: number;
  label: string;
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

function getInitial(label: string): string {
  return label.charAt(0);
}

function getAvatarColor(label: string): string {
  const colors = ['avatar-emerald', 'avatar-blue', 'avatar-amber', 'avatar-purple', 'avatar-stone'];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) - hash) + label.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
}

function CategoryRow({
  node,
  depth,
  hasChildren,
  initial,
  avatarColor,
}: {
  node: CategoryItem;
  depth: number;
  hasChildren: boolean;
  initial: string;
  avatarColor: string;
}) {
  const isParent = depth === 0;
  return (
    <tr className={isParent ? 'tree-row' : 'tree-row child-row'}>
      <td>
        <div className="tree-parent-name" style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.5}rem` : '0' }}>
          {depth > 0 && (
            <span className="tree-connector" style={{ display: 'inline-block', width: '1.25rem', position: 'relative' }} />
          )}
          {!hasChildren && isParent && (
            <span className="tree-toggle-btn" style={{ visibility: 'hidden' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </span>
          )}
          <div className={`avatar ${avatarColor}`} style={depth > 0 ? { width: '1.75rem', height: '1.75rem', fontSize: '0.625rem' } : {}}>
            {initial}
          </div>
          <span className="font-bold text-stone-800">{node.label}</span>
          {hasChildren && <span className="child-count-badge">{node.children.length}子</span>}
        </div>
      </td>
      <td className="text-center">
        <span className="font-bold text-stone-700 text-sm">—</span>
      </td>
      <td className="text-center">
        <div className="flex items-center justify-center gap-1">
          <button className="btn-ghost btn-sm">編集</button>
          <button className="btn-ghost-danger btn-sm">削除</button>
        </div>
      </td>
    </tr>
  );
}

function CategoryTree({ nodes, depth = 0 }: { nodes: CategoryItem[]; depth?: number }) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const initial = getInitial(node.label);
        const avatarColor = getAvatarColor(node.label);

        return (
          <Fragment key={node.id}>
            <CategoryRow
              node={node}
              depth={depth}
              hasChildren={hasChildren}
              initial={initial}
              avatarColor={avatarColor}
            />
            {hasChildren && (
              <CategoryTree nodes={node.children} depth={depth + 1} />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export default async function CategoriesAdminPage() {
  const actor = await getCurrentActor();
  const taxonomy = await getTaxonomyOptions();

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  const flatCategories: CategoryItem[] = taxonomy.categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    name: cat.label,
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

        {/* セクション1: カテゴリ作成 / 編集 */}
        <div className="animate-float-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">カテゴリ作成 / 編集</h2>
          </div>
          <p className="text-stone-500 text-sm mb-6 pl-4">Wikiのカテゴリを追加または編集します。親カテゴリを指定すると階層構造になります。</p>

          <div className="card">
            <div className="card-body">
              <div className="space-y-6">
                <CategoryCreateForm
                  categories={taxonomy.categories.map((category) => ({
                    id: category.id,
                    label: category.label,
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
          <p className="text-stone-500 text-sm mb-6 pl-4">カテゴリの親子関係が一目で分かります</p>

          <div className="card">
            {/* ツールバー */}
            <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="search-box">
                <svg className="search-box-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="search" placeholder="カテゴリを検索..." className="search-box-input" />
              </div>
              <button className="btn-primary btn-sm" style={{ background: '#f59e0b', color: 'white', fontWeight: 700, borderRadius: '0.625rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', border: 'none', cursor: 'pointer' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                新規作成
              </button>
            </div>

            {/* テーブル（ツリー構造） */}
            {tree.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </div>
                <p className="text-stone-500 text-sm">カテゴリはまだありません。</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>カテゴリ名</th>
                      <th className="text-center">項目数</th>
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CategoryTree nodes={tree} />
                  </tbody>
                </table>
              </div>
            )}

            {/* フッター: ページネーション */}
            <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{taxonomy.categories.length}</strong> 件</span>
              <div className="pagination">
                <button className="page-btn" disabled>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
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
