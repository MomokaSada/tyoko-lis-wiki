import { listReferencedThumbnailUrls } from '@/server/repositories/contentRepository';
import {
    deleteThumbnailObjects,
    extractThumbnailStoragePath,
    listAllThumbnailObjects,
} from '@/server/lib/thumbnailUpload';
import { ThumbnailObject } from '@/server/lib/thumbnailUpload';

import type { PrivilegedActor as Actor } from '@/types/actor';
import { serviceErrors } from '@/server/errors';

const CLEANUP_MIN_AGE_HOURS = 24;

function classifyOrphans(
  storageObjects: ThumbnailObject[],
  referencedPaths: Set<string>,
) {
  const cutoff = Date.now() - CLEANUP_MIN_AGE_HOURS * 60 * 60 * 1000;
  let orphanCount = 0;
  let orphanSize = 0;

  for (const object of storageObjects) {
    if (referencedPaths.has(object.path)) continue;

    const timestamp = object.createdAt?.getTime() ?? object.updatedAt?.getTime();
    if (!timestamp || timestamp > cutoff) continue;

    orphanCount++;
    orphanSize += object.size ?? 0;
  }

  return { orphanCount, orphanSize };
}

export async function getOrphanThumbnailStats(actor: Actor) {
  if (actor.role !== 'owner') {
    return { scannedCount: 0, referencedCount: 0, orphanCount: 0, orphanSize: 0, scannedAt: null };
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

  const { orphanCount, orphanSize } = classifyOrphans(storageObjects, referencedPaths);

  return {
    scannedCount: storageObjects.length,
    referencedCount: referencedPaths.size,
    orphanCount,
    orphanSize,
    scannedAt: new Date(),
  };
}

export async function cleanupOrphanThumbnails(actor: Actor) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: serviceErrors.thumbnail.cleanupPermissionDenied,
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

  const { orphanCount } = classifyOrphans(storageObjects, referencedPaths);

  const cutoff = Date.now() - CLEANUP_MIN_AGE_HOURS * 60 * 60 * 1000;
  const orphanPaths = storageObjects
    .filter((object) => {
      if (referencedPaths.has(object.path)) return false;
      const timestamp = object.createdAt?.getTime() ?? object.updatedAt?.getTime();
      return !!timestamp && timestamp <= cutoff;
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
