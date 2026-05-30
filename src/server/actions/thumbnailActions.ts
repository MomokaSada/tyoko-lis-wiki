'use server';

import { getCurrentActor } from '@/server/lib/currentActor';
import { cleanupOrphanThumbnails, getOrphanThumbnailStats } from '@/server/services/thumbnailService';
import type { BaseActionState } from '@/types/actionState';

export type ThumbnailScanResult = {
  scannedCount: number;
  referencedCount: number;
  orphanCount: number;
  orphanSize: number;
  scannedAt: string;
};

export type ThumbnailCleanupActionState = BaseActionState & {
  deletedCount: number;
  scannedCount: number;
  referencedCount: number;
  minAgeHours: number;
};

export async function scanThumbnailsAction(): Promise<ThumbnailScanResult | { error: string }> {
  const actor = await getCurrentActor();

  if (!actor) {
    return { error: '権限がありません' };
  }

  const stats = await getOrphanThumbnailStats(actor);
  if (!stats.scannedAt) {
    return { error: '権限がありません' };
  }

  return {
    scannedCount: stats.scannedCount,
    referencedCount: stats.referencedCount,
    orphanCount: stats.orphanCount,
    orphanSize: stats.orphanSize,
    scannedAt: stats.scannedAt.toISOString(),
  };
}

export async function cleanupOrphanThumbnailsAction(
  _prevState: ThumbnailCleanupActionState,
): Promise<ThumbnailCleanupActionState> {
  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: '未使用サムネイルの掃除権限がありません',
      deletedCount: 0,
      scannedCount: 0,
      referencedCount: 0,
      minAgeHours: 24,
    };
  }

  const result = await cleanupOrphanThumbnails(actor);

  if (!result.success) {
    return {
      error: result.error,
      deletedCount: 0,
      scannedCount: 0,
      referencedCount: 0,
      minAgeHours: 24,
    };
  }

  return {
    error: null,
    deletedCount: result.data.deletedCount,
    scannedCount: result.data.scannedCount,
    referencedCount: result.data.referencedCount,
    minAgeHours: result.data.minAgeHours,
  };
}
