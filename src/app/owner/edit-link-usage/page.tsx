import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/server/lib/formatDateTime';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';

function getSessionStatusLabel(record: {
  sessionIsActive: boolean;
  sessionEndAt: Date;
  editsUsed: number;
  maxEdits: number;
}) {
  if (!record.sessionIsActive) {
    return '無効化済み';
  }

  if (record.editsUsed >= record.maxEdits) {
    return '上限到達';
  }

  if (record.sessionEndAt <= new Date()) {
    return '期限切れ';
  }

  return '有効';
}

export default async function EditLinkUsagePage() {
  const actor = await getCurrentActor();
  const records = actor ? await getDeviceSessionUsageRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        編集リンク使用状況
      </h1>

      {!isOwner ? (
        <p style={{ color: '#b45309' }}>この機能は owner のみ利用できます。</p>
      ) : records.length === 0 ? (
        <p>編集リンクの使用記録はまだありません。</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {records.map((record) => (
            <article
              key={record.recordId}
              style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}
            >
              <p><strong>状態:</strong> {getSessionStatusLabel(record)}</p>
              <p><strong>編集リンクUUID:</strong> <code>{record.sessionId}</code></p>
              <p><strong>発行者:</strong> {record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}</p>
              <p><strong>使用回数:</strong> {record.editsUsed} / {record.maxEdits}</p>
              <p><strong>deviceSession ID:</strong> {record.recordId}</p>
              <p><strong>device ID:</strong> {record.deviceId}</p>
              <p><strong>IP:</strong> {record.ip}</p>
              <p><strong>ブラウザ:</strong> {record.browser}</p>
              <p><strong>紐づく編集リビジョン数:</strong> {record.revisionCount}</p>
              <p><strong>セッション開始:</strong> {formatDateTimeJst(record.sessionStartAt)}</p>
              <p><strong>セッション終了:</strong> {formatDateTimeJst(record.sessionEndAt)}</p>
              <p><strong>リンク発行日時:</strong> {formatDateTimeJst(record.sessionCreatedAt)}</p>
              <p><strong>初回利用記録:</strong> {formatDateTimeJst(record.firstRecordedAt)}</p>
              <p><strong>最終利用記録:</strong> {formatDateTimeJst(record.lastRecordedAt)}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
