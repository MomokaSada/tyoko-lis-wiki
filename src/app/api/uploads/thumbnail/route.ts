import { NextResponse } from 'next/server';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { uploadThumbnailFile } from '@/server/lib/thumbnailUpload';

import { checkRateLimit } from '@/server/services/rateLimitService';
import { apiErrors } from '@/server/errors';

export async function POST(request: Request) {
  const rateLimitResult = await checkRateLimit('thumbnailUpload');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: apiErrors.thumbnail.uploadRateLimitExceeded,
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const session =
    typeof formData.get('session') === 'string'
      ? (formData.get('session') as string)
      : null;
  const editor = await getCurrentEditor(session);

  if (!editor) {
    return NextResponse.json(
      {
        error: apiErrors.thumbnail.uploadPermissionDenied,
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
            : apiErrors.thumbnail.uploadFailed,
      },
      { status: 400 },
    );
  }
}
