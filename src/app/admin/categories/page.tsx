import { getCurrentActor } from '@/server/lib/currentActor';
import { getTaxonomyOptions } from '@/server/services/contentService';
import { CategoryCreateForm } from './category-create-form';
import { CategoryUpdateForm } from './category-update-form';
import Link from 'next/link';

export default async function CategoriesAdminPage() {
  const actor = await getCurrentActor();
  const taxonomy = await getTaxonomyOptions();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-2">カテゴリ管理</h1>
        <p className="text-stone-500 font-medium">管理者以上がカテゴリの追加と親子関係の整理を行うためのページです。</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-bold text-stone-600">
          ログインユーザー: {actor ? `${actor.role} (id: ${actor.id})` : '未取得'}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">新規カテゴリ作成</h2>
        <CategoryCreateForm
          categories={taxonomy.categories.map((category) => ({
            id: category.id,
            label: category.label,
          }))}
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">既存カテゴリ一覧</h2>
        {taxonomy.categories.length === 0 ? (
          <p className="text-stone-500">カテゴリはまだありません。</p>
        ) : (
          <div className="space-y-4">
            {taxonomy.categories.map((category) => (
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
        )}
      </div>

      <div className="pt-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← 管理画面に戻る
        </Link>
      </div>
    </div>
  );
}
