'use client';

import { Fragment, useState, useActionState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CategoryUpdateForm } from './category-update-form';
import { deleteCategoryAction } from '@/server/actions/categoryActions';
import { X, ChevronRight, FolderTree, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

type CategoryItem = {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryItem[];
};

type FlatCategory = {
  id: number;
  name: string;
  parentId: number | null;
};

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

function getParentChain(
  categoryId: number,
  allCategories: FlatCategory[],
  tree: CategoryItem[],
): string[] {
  const cat = allCategories.find((c) => c.id === categoryId);
  if (!cat) return [];

  // Find parentId from tree by searching recursively
  function findParentId(id: number, nodes: CategoryItem[]): number | null {
    for (const node of nodes) {
      if (node.id === id) return node.parentId;
      if (node.children.length > 0) {
        const found = findParentId(id, node.children);
        if (found !== undefined) return found;
      }
    }
    return null;
  }

  const chain: string[] = [cat.name];
  let currentId: number | null = categoryId;
  for (let i = 0; i < 10; i++) {
    const pid = findParentId(currentId, tree);
    if (pid === null) break;
    const parent = allCategories.find((c) => c.id === pid);
    if (!parent) break;
    chain.unshift(parent.name);
    currentId = pid;
  }
  return chain;
}

/* ── モーダル backdrop（Portal で body 直下に表示） ── */
function ModalBackdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-float-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ── 親子関係モーダル ── */
function CategoryInfoModal({
  category,
  allCategories,
  tree,
  onClose,
}: {
  category: CategoryItem;
  allCategories: FlatCategory[];
  tree: CategoryItem[];
  onClose: () => void;
}) {
  const parentChain = getParentChain(category.id, allCategories, tree);
  const childCount = category.children.length;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="card">
        <div className="card-body space-y-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`avatar ${getAvatarColor(category.name)}`}>
                {getInitial(category.name)}
              </div>
              <div>
                <h3 className="font-black text-stone-900">{category.name}</h3>
                <span className="text-[10px] text-stone-400 font-mono">id: {category.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 親パス */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">親カテゴリパス</p>
            {parentChain.length <= 1 ? (
              <p className="text-sm text-stone-500">トップレベルカテゴリ（親なし）</p>
            ) : (
              <div className="flex items-center flex-wrap gap-1">
                {parentChain.map((name, i) => (
                  <Fragment key={i}>
                    {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-300" />}
                    <span className={`text-sm font-bold ${i === parentChain.length - 1 ? 'text-emerald-700' : 'text-stone-500'}`}>
                      {name}
                    </span>
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {/* 子カテゴリ */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              子カテゴリ <span className="text-stone-300 ml-1">({childCount})</span>
            </p>
            {childCount === 0 ? (
              <p className="text-sm text-stone-400">子カテゴリはありません</p>
            ) : (
              <div className="space-y-1">
                  {category.children.map((child) => (
                  <div key={child.id} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl">
                    <div className={`avatar ${getAvatarColor(child.name)}`} style={{ width: '1.5rem', height: '1.5rem', fontSize: '0.5rem' }}>
                      {getInitial(child.name)}
                    </div>
                    <span className="text-sm font-bold text-stone-700">{child.name}</span>
                    {child.children.length > 0 && (
                      <span className="child-count-badge">{child.children.length}子</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ── 削除確認モーダル ── */
function CategoryDeleteModal({
  category,
  onClose,
}: {
  category: CategoryItem;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(
    deleteCategoryAction,
    { error: null, success: null },
  );

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="card">
        <div className="card-body space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-stone-900">カテゴリを削除</h3>
                <p className="text-sm text-stone-500">
                  「{category.name}」を削除しますか？
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">注意事項</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>子カテゴリがある場合、それらはトップレベルカテゴリになります</li>
              <li>この操作は元に戻せません</li>
            </ul>
          </div>

          {state.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {state.success}
            </div>
          )}
          {state.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="flex items-center justify-end gap-3 pt-2">
            <input type="hidden" name="id" value={category.id} />
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ fontWeight: 700, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPending || !!state.success}
              className="btn-danger"
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 削除中...</>
              ) : (
                <><Trash2 className="w-4 h-4" /> 削除する</>
              )}
            </button>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ── 編集モーダル ── */
function CategoryEditModal({
  category,
  categories,
  onClose,
}: {
  category: CategoryItem;
  categories: FlatCategory[];
  onClose: () => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-stone-900">カテゴリを編集</h3>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <CategoryUpdateForm
            category={{
              id: category.id,
              name: category.name,
              parentId: category.parentId,
            }}
            categories={categories}
            onSuccess={onClose}
          />
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ── 行 ── */
function CategoryRow({
  node,
  depth,
  guides,
  hasChildren,
  allCategories,
  tree,
  onEdit,
  onShowInfo,
  onDelete,
}: {
  node: CategoryItem;
  depth: number;
  guides: Set<number>;
  hasChildren: boolean;
  allCategories: FlatCategory[];
  tree: CategoryItem[];
  onEdit: (node: CategoryItem) => void;
  onShowInfo: (node: CategoryItem) => void;
  onDelete: (node: CategoryItem) => void;
}) {
  const isParent = depth === 0;
  const initial = getInitial(node.name);
  const avatarColor = getAvatarColor(node.name);

  // tree コマンド風のガイド線を組み立て
  const slots: React.ReactNode[] = [];
  for (let level = 0; level < depth; level++) {
    slots.push(
      <span key={`g-${level}`} className={guides.has(level) ? 'tree-guide' : 'tree-guide-space'} />,
    );
  }
  if (depth > 0) {
    slots.push(<span key="connector" className="tree-connector" />);
  }

  return (
    <tr className={isParent ? 'tree-row' : 'tree-row child-row'}>
      <td>
        <div className="tree-parent-name">
          {slots}
          <div className={`avatar ${avatarColor}`} style={depth > 0 ? { width: '1.75rem', height: '1.75rem', fontSize: '0.625rem' } : {}}>
            {initial}
          </div>
          <span className="font-bold text-stone-800">{node.name}</span>
          {hasChildren && <span className="child-count-badge">{node.children.length}子</span>}
        </div>
      </td>
      <td className="text-center">
        <button
          className="btn-ghost btn-sm"
          onClick={() => onShowInfo(node)}
          title="親子関係を表示"
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span className="ml-1">関連</span>
        </button>
      </td>
      <td className="text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            className="btn-ghost btn-sm"
            onClick={() => onEdit(node)}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="ml-1">編集</span>
          </button>
          <button
            className="btn-ghost-danger btn-sm"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="ml-1">削除</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── ツリー ── */
function CategoryTreeNodes({
  nodes,
  depth = 0,
  guides = new Set<number>(),
  allCategories,
  tree,
  onEdit,
  onShowInfo,
  onDelete,
}: {
  nodes: CategoryItem[];
  depth?: number;
  guides?: Set<number>;
  allCategories: FlatCategory[];
  tree: CategoryItem[];
  onEdit: (node: CategoryItem) => void;
  onShowInfo: (node: CategoryItem) => void;
  onDelete: (node: CategoryItem) => void;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        const hasChildren = node.children.length > 0;
        const isLast = index === nodes.length - 1;

        // 子に渡すガイド: 親のガイド + 現在階層に次の兄弟がいる場合
        const childGuides = new Set(guides);
        if (!isLast) childGuides.add(depth);

        return (
          <Fragment key={node.id}>
            <CategoryRow
              node={node}
              depth={depth}
              guides={guides}
              hasChildren={hasChildren}
              allCategories={allCategories}
              tree={tree}
              onEdit={onEdit}
              onShowInfo={onShowInfo}
              onDelete={onDelete}
            />
            {hasChildren && (
              <CategoryTreeNodes
                nodes={node.children}
                depth={depth + 1}
                guides={childGuides}
                allCategories={allCategories}
                tree={tree}
                onEdit={onEdit}
                onShowInfo={onShowInfo}
                onDelete={onDelete}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

/* ── メインクライアントコンポーネント ── */
export function CategoryTreeClient({
  tree,
  allCategories,
}: {
  tree: CategoryItem[];
  allCategories: FlatCategory[];
}) {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [infoCategory, setInfoCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  return (
    <>
      {/* ツリー本体 */}
      <div className="table-container">
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '55%' }}>カテゴリ名</th>
              <th className="text-center" style={{ width: '20%' }}>親子関係</th>
              <th className="text-center" style={{ width: '25%' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <p className="text-stone-500 text-sm">カテゴリはまだありません。</p>
                  </div>
                </td>
              </tr>
            ) : (
              <CategoryTreeNodes
                nodes={tree}
                allCategories={allCategories}
                tree={tree}
                onEdit={setEditingCategory}
                onShowInfo={setInfoCategory}
                onDelete={setDeletingCategory}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          categories={allCategories}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* 親子関係モーダル */}
      {infoCategory && (
        <CategoryInfoModal
          category={infoCategory}
          allCategories={allCategories}
          tree={tree}
          onClose={() => setInfoCategory(null)}
        />
      )}

      {/* 削除確認モーダル */}
      {deletingCategory && (
        <CategoryDeleteModal
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </>
  );
}
