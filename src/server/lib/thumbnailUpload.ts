import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

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

async function ensureBucketExists(bucket: string) {
  if (bucketVerified) {
    return;
  }

  const supabase = createAdminClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(`Storage バケット一覧の取得に失敗しました: ${error.message}`);
  }

  if (!buckets.some((item) => item.name === bucket)) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: `${MAX_THUMBNAIL_SIZE}`,
      allowedMimeTypes: [...ALLOWED_MIME_TYPES],
    });

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
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`サムネイル画像のアップロードに失敗しました: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
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

export async function listAllThumbnailObjects(prefix = ''): Promise<Array<{
  path: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}>> {
  const entries = await listStorageEntries(prefix);
  const files: Array<{ path: string; createdAt: Date | null; updatedAt: Date | null }> = [];

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
