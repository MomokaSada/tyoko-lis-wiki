'use server';

import { cleanupOrphanThumbnails, getOrphanThumbnailStats } from '@/server/services/thumbnailService';
import { requireActor } from '@/server/actions/modules/withAction';
import type { BaseActionState } from '@/types/actionState';

/*
 * 管理系の保守 Action。
 * 一般の Action と比べて共通前処理（レート制限・デバイス記録・Zod パース）が
 * 不要なため、意図的にシンプルな構造を保つ。
 * スキーマパースが必要になった場合のみ withAction に寄せる。
 */

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
  const actor = await requireActor();
  if ('error' in actor) {
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
  const actor = await requireActor();
  if ('error' in actor) {
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
