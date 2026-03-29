import { EditLinkForm } from './edit-link-form';
export default function EditLinksPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        記事編集リンク管理
      </h1>

      <EditLinkForm />
    </main>
  );
}
