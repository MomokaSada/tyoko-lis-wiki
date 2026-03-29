import { AccountCreateLinkForm } from './account-create-link-form';

export default function AccountCreateLinksPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        アカウント作成リンク管理
      </h1>

      <AccountCreateLinkForm />
    </main>
  );
}
