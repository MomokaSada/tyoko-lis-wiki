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

async function ensureBucketExists(bucket: string) {
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
}

export async function uploadThumbnailFile(file: File) {
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

export async function resolveThumbnailUrl(input: {
  file: FormDataEntryValue | null;
  existingUrl?: string | null;
  required: boolean;
}) {
  const existingUrl = input.existingUrl?.trim() ?? '';

  if (input.file instanceof File && input.file.size > 0) {
    return uploadThumbnailFile(input.file);
  }

  if (existingUrl) {
    return existingUrl;
  }

  if (input.required) {
    throw new Error('サムネイル画像を選択してください');
  }

  return existingUrl;
}
