import { NextResponse } from 'next/server';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { uploadThumbnailFile } from '@/server/lib/thumbnailUpload';

export async function POST(request: Request) {
  const formData = await request.formData();
  const session =
    typeof formData.get('session') === 'string'
      ? (formData.get('session') as string)
      : null;
  const editor = await getCurrentEditor(session);

  if (!editor) {
    return NextResponse.json(
      {
        error: 'サムネイルをアップロードする権限がありません',
      },
      { status: 403 },
    );
  }

  try {
    const url = await uploadThumbnailFile(formData.get('file'));

    return NextResponse.json({
      url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'サムネイル画像のアップロードに失敗しました',
      },
      { status: 400 },
    );
  }
}
