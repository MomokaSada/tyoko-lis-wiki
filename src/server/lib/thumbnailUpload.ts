import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';

const DEFAULT_BUCKET = 'content-thumbnails';
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function getBucketName() {
  return process.env.SUPABASE_THUMBNAIL_BUCKET ?? DEFAULT_BUCKET;
}

type StorageEntry = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: { size?: number } | null;
};

function getExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 10) {
    return fromName;
  }

  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

let bucketVerified = false;

function isHtmlJsonParseError(e: unknown): boolean {
  return (
    e instanceof SyntaxError &&
    e.message.includes('Unexpected token') &&
    (e.message.includes('<') || e.message.includes('<!DOCTYPE'))
  );
}

function buildSupabaseUrlCheckHint(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(未設定)';
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return `NEXT_PUBLIC_SUPABASE_URL=${url}, SUPABASE_SERVICE_ROLE_KEY=${hasKey ? '設定済み' : '未設定'}`;
}

async function ensureBucketExists(bucket: string) {
  if (bucketVerified) {
    return;
  }

  const supabase = createAdminClient();

  let buckets: { name: string }[] = [];
  try {
    const result = await supabase.storage.listBuckets();
    if (result.error) {
      throw new Error(result.error.message);
    }
    buckets = result.data ?? [];
  } catch (e) {
    if (isHtmlJsonParseError(e)) {
      throw new Error(
        `Supabase Storage API から HTML が返されました（JSON の応答を期待）。` +
        `環境変数の設定を確認してください: ${buildSupabaseUrlCheckHint()}`,
      );
    }
    // 既に Error インスタンスならそのまま再 throw
    throw e;
  }

  if (!buckets.some((item) => item.name === bucket)) {
    let createError: { message: string } | null = null;
    try {
      const result = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: `${MAX_THUMBNAIL_SIZE}`,
        allowedMimeTypes: [...ALLOWED_MIME_TYPES],
      });
      createError = result.error;
    } catch (e) {
      if (isHtmlJsonParseError(e)) {
        throw new Error(
          `Supabase Storage API から HTML が返されました（JSON の応答を期待）。` +
          `環境変数の設定を確認してください: ${buildSupabaseUrlCheckHint()}`,
        );
      }
      throw e;
    }

    if (createError) {
      throw new Error(`Storage バケット作成に失敗しました: ${createError.message}`);
    }
  }

  bucketVerified = true;
}

export async function uploadThumbnailFile(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('サムネイル画像を選択してください');
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('サムネイル画像は JPEG / PNG / WEBP / GIF のみアップロードできます');
  }

  if (file.size > MAX_THUMBNAIL_SIZE) {
    throw new Error('サムネイル画像は5MB以下にしてください');
  }

  const bucket = getBucketName();
  await ensureBucketExists(bucket);

  const supabase = createAdminClient();
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${getExtension(file)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  let uploadError: { message: string } | null = null;
  try {
    const result = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    uploadError = result.error;
  } catch (e) {
    // Supabase クライアントが非 JSON レスポンス（HTML など）を受けると
    // JSON.parse エラーが発生する。より具体的なメッセージに差し替える。
    const isJsonParseError =
      e instanceof SyntaxError &&
      e.message.includes('Unexpected token') &&
      e.message.includes('<');
    if (isJsonParseError) {
      throw new Error(
        `Supabase Storage API からの応答が無効です。` +
        `NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が` +
        `正しく設定されているか確認してください。`,
      );
    }
    throw new Error(
      `サムネイル画像のアップロードに失敗しました（通信エラー）: ${e instanceof Error ? e.message : '不明なエラー'}`,
    );
  }

  if (uploadError) {
    throw new Error(`サムネイル画像のアップロードに失敗しました: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  try {
    const url = new URL(data.publicUrl);
    // url.pathname はデコードされた状態で返る（例: %20 → スペース）ので、
    // 不正な文字が含まれないようパスを再エンコードする
    const encoded = url.pathname.split('/').map(seg => encodeURIComponent(seg)).join('/');
    return encoded;
  } catch {
    return data.publicUrl;
  }
}

function joinPrefix(prefix: string, name: string) {
  return prefix ? `${prefix}/${name}` : name;
}

async function listStorageEntries(prefix: string) {
  const bucket = getBucketName();
  const supabase = createAdminClient();
  const entries: StorageEntry[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Storage ファイル一覧の取得に失敗しました: ${error.message}`);
    }

    entries.push(...data);

    if (data.length < 100) {
      break;
    }

    offset += data.length;
  }

  return entries;
}

export type ThumbnailObject = {
  path: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  size: number | null;
};

export async function listAllThumbnailObjects(prefix = ''): Promise<ThumbnailObject[]> {
  const entries = await listStorageEntries(prefix);
  const files: ThumbnailObject[] = [];

  for (const entry of entries) {
    const path = joinPrefix(prefix, entry.name);
    const isDirectory = !entry.id;

    if (isDirectory) {
      files.push(...(await listAllThumbnailObjects(path)));
      continue;
    }

    files.push({
      path,
      createdAt: entry.created_at ? new Date(entry.created_at) : null,
      updatedAt: entry.updated_at ? new Date(entry.updated_at) : null,
      size: entry.metadata?.size ?? null,
    });
  }

  return files;
}

export function extractThumbnailStoragePath(publicUrl: string) {
  const bucket = getBucketName();
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const rawPath = publicUrl.slice(markerIndex + marker.length);

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

export { getPublicThumbnailUrl };

export async function deleteThumbnailObjects(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const bucket = getBucketName();
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`未使用サムネイルの削除に失敗しました: ${error.message}`);
  }
}
