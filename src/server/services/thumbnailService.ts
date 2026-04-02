import { listReferencedThumbnailUrls } from '@/server/repositories/contentRepository';
import {
  deleteThumbnailObjects,
  extractThumbnailStoragePath,
  listAllThumbnailObjects,
} from '@/server/lib/thumbnailUpload';

type Actor = {
  id: number;
  role: 'owner' | 'admin';
};

const CLEANUP_MIN_AGE_HOURS = 24;

export async function cleanupOrphanThumbnails(actor: Actor) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: '未使用サムネイルの掃除権限がありません',
    };
  }

  const [referencedUrls, storageObjects] = await Promise.all([
    listReferencedThumbnailUrls(),
    listAllThumbnailObjects(),
  ]);

  const referencedPaths = new Set(
    referencedUrls
      .filter((url): url is string => Boolean(url))
      .map((url) => extractThumbnailStoragePath(url))
      .filter((path): path is string => Boolean(path)),
  );

  const cutoff = Date.now() - CLEANUP_MIN_AGE_HOURS * 60 * 60 * 1000;
  const orphanPaths = storageObjects
    .filter((object) => {
      if (referencedPaths.has(object.path)) {
        return false;
      }

      const timestamp = object.createdAt?.getTime() ?? object.updatedAt?.getTime();

      if (!timestamp) {
        return false;
      }

      return timestamp <= cutoff;
    })
    .map((object) => object.path);

  await deleteThumbnailObjects(orphanPaths);

  return {
    success: true as const,
    data: {
      scannedCount: storageObjects.length,
      referencedCount: referencedPaths.size,
      deletedCount: orphanPaths.length,
      minAgeHours: CLEANUP_MIN_AGE_HOURS,
    },
  };
}
