import { getCurrentActor } from '@/server/lib/currentActor';
import { getTaxonomyOptions } from '@/server/services/contentService';
import { CategoryCreateForm } from './category-create-form';
import { CategoryUpdateForm } from './category-update-form';

export default async function CategoriesAdminPage() {
  const actor = await getCurrentActor();
  const taxonomy = await getTaxonomyOptions();

  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
      <div>
        <h1>カテゴリ管理</h1>
        <p>管理者以上がカテゴリの追加と親子関係の整理を行うためのページです。</p>
        <p>
          <strong>ログインユーザー:</strong> {actor ? `${actor.role} (id: ${actor.id})` : '未取得'}
        </p>
      </div>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <h2>新規カテゴリ作成</h2>
        <CategoryCreateForm
          categories={taxonomy.categories.map((category) => ({
            id: category.id,
            label: category.label,
          }))}
        />
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <h2>既存カテゴリ一覧</h2>
        {taxonomy.categories.length === 0 ? (
          <p>カテゴリはまだありません。</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {taxonomy.categories.map((category) => (
              <CategoryUpdateForm
                key={category.id}
                category={category}
                categories={taxonomy.categories.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
              />
            ))}
          </div>
        )}
      </section>

      <a href="/admin" style={{ color: 'blue' }}>
        管理画面に戻る
      </a>
    </main>
  );
}
