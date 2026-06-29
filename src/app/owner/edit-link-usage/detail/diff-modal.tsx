'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { GitCompare, X, PenLine, Tag, FolderTree, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRevisionDiff } from '@/server/actions/revisionActions';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import {
    DiffPart,
    TagCategoryDiff,
} from '@/server/services/revisionService';

type DiffLine = {
  kind: 'add' | 'del' | 'normal';
  content: string;
  oldLine: number | null;
  newLine: number | null;
};

/** DiffPart[] を1行ごとの DiffLine[] に展開し、行番号を振る */
function expandParts(parts: DiffPart[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const part of parts) {
    const raw = part.value;
    // value は末尾に改行を含む場合があるので split する
    const items = raw.split('\n');
    // 最後が空文字列なら末尾改行 (diffLines は各行を \n 付きで返す)
    const trailingNewline = items[items.length - 1] === '';
    const lineContents = trailingNewline ? items.slice(0, -1) : items;

    if (part.removed) {
      for (const text of lineContents) {
        oldLine++;
        lines.push({ kind: 'del', content: text, oldLine, newLine: null });
      }
    } else if (part.added) {
      for (const text of lineContents) {
        newLine++;
        lines.push({ kind: 'add', content: text, oldLine: null, newLine });
      }
    } else {
      for (const text of lineContents) {
        oldLine++;
        newLine++;
        lines.push({ kind: 'normal', content: text, oldLine, newLine });
      }
    }
  }

  return lines;
}

function DiffViewer({ lines }: { lines: DiffLine[] }) {
  // 全ての行で最大の oldLine / newLine を算出 → 桁揃え用の幅
  const maxOld = useMemo(() => Math.max(...lines.map((l) => l.oldLine ?? 0), 0), [lines]);
  const maxNew = useMemo(() => Math.max(...lines.map((l) => l.newLine ?? 0), 0), [lines]);
  const padWidth = `${Math.max(String(maxOld).length, String(maxNew).length, 2)}ch`;

  return (
    <div className="text-xs font-mono leading-5 rounded-lg border border-stone-200 overflow-hidden">
      {/* ヘッダー行 */}
      <div className="flex bg-stone-100 text-stone-400 border-b border-stone-200 select-none">
        <div className="w-[4.5ch] shrink-0 text-right pr-2 py-0.5" style={{ width: padWidth }}>旧</div>
        <div className="w-[4.5ch] shrink-0 text-right pr-2 py-0.5" style={{ width: padWidth }}>新</div>
        <div className="flex-1 px-3 py-0.5" />
      </div>

      {lines.map((line, i) => {
        let bg = '';
        let sign = ' ';
        if (line.kind === 'add') { bg = 'bg-emerald-50'; sign = '+'; }
        else if (line.kind === 'del') { bg = 'bg-red-50'; sign = '-'; }

        return (
          <div key={i} className={`flex ${bg} hover:bg-stone-100/50`}>
            <div
              className="shrink-0 text-right pr-2 py-0.5 text-stone-400 tabular-nums"
              style={{ width: padWidth }}
            >
              {line.oldLine ?? ''}
            </div>
            <div
              className="shrink-0 text-right pr-2 py-0.5 text-stone-400 tabular-nums"
              style={{ width: padWidth }}
            >
              {line.newLine ?? ''}
            </div>
            <div
              className={`flex-1 px-3 py-0.5 whitespace-pre-wrap break-all ${
                line.kind === 'add'
                  ? 'text-emerald-800'
                  : line.kind === 'del'
                    ? 'text-red-800'
                    : 'text-stone-700'
              }`}
            >
              {sign} {line.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DiffModal({
  contentId,
  revisionNumber,
  revisionCount,
  editorLabel,
  revisionLabels,
}: {
  contentId: number;
  revisionNumber: number;
  /** コンテンツの総リビジョン数（省略時は prev/next ナビゲーションを非表示） */
  revisionCount?: number;
  /** 編集者の表示ラベル（owner 権限時のみ） */
  editorLabel?: string | null;
  /** リビジョン番号 → 編集者ラベルのマップ（prev/next 移動時用） */
  revisionLabels?: Record<number, string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldFailed, setOldFailed] = useState(false);
  const [newFailed, setNewFailed] = useState(false);
  const [currentRevision, setCurrentRevision] = useState(revisionNumber);
  const [diff, setDiff] = useState<{
    oldTitle: string | null;
    newTitle: string | null;
    titleDiff: DiffPart[];
    bodyDiff: DiffPart[];
    oldThumbnail: string | null;
    newThumbnail: string | null;
    thumbnailChanged: boolean;
    tagDiff: TagCategoryDiff;
    categoryDiff: TagCategoryDiff;
  } | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setDiff(null);
    setError(null);
    setOldFailed(false);
    setNewFailed(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const fetchDiff = useCallback(async (rev: number) => {
    setLoading(true);
    // エラーのみクリア、diff は残してスケルトン表示を避ける
    setError(null);
    setOldFailed(false);
    setNewFailed(false);
    try {
      const result = await getRevisionDiff(contentId, rev);
      if (!result) {
        setError('差分データを取得できませんでした。');
      } else {
        setDiff(result);
        setError(null);
      }
    } catch {
      setError('差分の取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setCurrentRevision(revisionNumber);
    await fetchDiff(revisionNumber);
  }, [revisionNumber, fetchDiff]);

  const goPrev = useCallback(() => {
    if (currentRevision > 1) {
      const prev = currentRevision - 1;
      setCurrentRevision(prev);
      fetchDiff(prev);
    }
  }, [currentRevision, fetchDiff]);

  const goNext = useCallback(() => {
    if (revisionCount && currentRevision < revisionCount) {
      const next = currentRevision + 1;
      setCurrentRevision(next);
      fetchDiff(next);
    }
  }, [currentRevision, revisionCount, fetchDiff]);

  const hasChanges = (parts: DiffPart[]) =>
    parts.some((p) => p.added || p.removed);

  const bodyLines = useMemo(
    () => (diff ? expandParts(diff.bodyDiff) : []),
    [diff],
  );

  // prev/next 移動時に currentRevision に応じた編集者ラベルを解決
  const currentEditorLabel = useMemo(
    () => revisionLabels?.[currentRevision] ?? editorLabel ?? null,
    [revisionLabels, currentRevision, editorLabel],
  );

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="btn-ghost btn-sm"
      >
        <GitCompare className="w-3.5 h-3.5" />
        <span className="ml-1">差分</span>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={close}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] animate-float-in card flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="card-body border-b border-stone-100 pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-stone-400" />
                    v{currentRevision - 1} → v{currentRevision}
                  </h3>

                  {/* prev/next ナビゲーション */}
                  {revisionCount && revisionCount > 1 && (
                    <div className="flex items-center gap-1 ml-2 pl-3 border-l border-stone-200">
                      <button
                        type="button"
                        disabled={currentRevision <= 1}
                        onClick={goPrev}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:text-stone-200 disabled:cursor-not-allowed transition-all"
                        title="前の差分"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-stone-400 font-mono tabular-nums min-w-[6ch] text-center select-none">
                        {currentRevision} / {revisionCount}
                      </span>
                      <button
                        type="button"
                        disabled={revisionCount !== undefined && currentRevision >= revisionCount}
                        onClick={goNext}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:text-stone-200 disabled:cursor-not-allowed transition-all"
                        title="次の差分"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={close}
                  className="btn-ghost btn-sm"
                  style={{ padding: '0.25rem' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 編集者ラベル */}
              {currentEditorLabel && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-200 rounded-md px-2 py-0.5">
                    <PenLine className="w-3 h-3" />
                    {currentEditorLabel}
                  </span>
                </div>
              )}

              {/* タイトル（変更なしの場合は簡易表示） */}
              {diff && (
                <div className="mt-3">
                  {hasChanges(diff.titleDiff) ? (
                    <p className="text-sm leading-relaxed break-all">
                      {diff.titleDiff.map((part, i) =>
                        part.added ? (
                          <span key={i} className="bg-emerald-100 text-emerald-800 rounded px-0.5">{part.value}</span>
                        ) : part.removed ? (
                          <span key={i} className="bg-red-100 text-red-800 rounded px-0.5 line-through">{part.value}</span>
                        ) : (
                          <span key={i}>{part.value}</span>
                        ),
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-stone-600">
                      タイトル: {diff.newTitle ?? '(空)'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* コンテンツ */}
            <div className="card-body overflow-y-auto space-y-4 flex-1 relative">
              {/* 初回読み込み中（まだ表示する差分がない） */}
              {loading && !diff && (
                <div className="animate-pulse space-y-4">
                  {/* タイトル行スケルトン */}
                  <div className="h-5 w-3/4 bg-stone-100 rounded" />

                  {/* Diff viewer スケルトン */}
                  <div className="rounded-lg border border-stone-200 overflow-hidden">
                    <div className="flex bg-stone-50 border-b border-stone-200 px-3 py-1.5 gap-2">
                      <div className="h-3 w-6 bg-stone-200 rounded" />
                      <div className="h-3 w-6 bg-stone-200 rounded" />
                    </div>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="flex items-center px-3 py-0.5 gap-2">
                        <div className="h-3.5 w-6 bg-stone-100 rounded shrink-0" />
                        <div className="h-3.5 w-6 bg-stone-100 rounded shrink-0" />
                        <div
                          className={`h-3.5 rounded ${
                            i === 0 ? 'bg-stone-200 w-3/5' :
                            i % 3 === 1 ? 'bg-emerald-100 w-2/5' :
                            i % 3 === 2 ? 'bg-red-100 w-1/3' :
                            'bg-stone-100 w-1/2'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-3 w-16 bg-stone-100 rounded" />
                    <div className="h-3 w-16 bg-stone-100 rounded" />
                  </div>
                </div>
              )}

              {/* 初回読み込みエラー */}
              {error && !diff && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                  {error}
                </div>
              )}

              {/* 差分コンテンツ（スワイプ遷移中も表示し続ける） */}
              {diff && (
                <>
                  {/* サムネイル変更 */}
                  {diff.thumbnailChanged && (
                    <section className="space-y-2">
                      <h4 className="text-xs font-bold text-stone-400">サムネイル変更</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-stone-400 font-bold">変更前</p>
                          <div className="aspect-[1200/630] rounded-lg border border-stone-200 overflow-hidden bg-stone-50 relative">
                            {getPublicThumbnailUrl(diff.oldThumbnail) && !oldFailed ? (
                              <Image
                                src={getPublicThumbnailUrl(diff.oldThumbnail)!}
                                alt="旧サムネイル"
                                fill
                                className="object-cover"
                                unoptimized
                                onError={() => setOldFailed(true)}
                              />
                            ) : (
                              <Image
                                src="/images/no-image.png"
                                alt="画像なし"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-stone-400 font-bold">変更後</p>
                          <div className="aspect-[1200/630] rounded-lg border border-stone-200 overflow-hidden bg-stone-50 relative">
                            {getPublicThumbnailUrl(diff.newThumbnail) && !newFailed ? (
                              <Image
                                src={getPublicThumbnailUrl(diff.newThumbnail)!}
                                alt="新サムネイル"
                                fill
                                className="object-cover"
                                unoptimized
                                onError={() => setNewFailed(true)}
                              />
                            ) : (
                              <Image
                                src="/images/no-image.png"
                                alt="画像なし"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* タグ・カテゴリ変更 */}
                  {(diff.tagDiff.added.length > 0 || diff.tagDiff.removed.length > 0 ||
                    diff.categoryDiff.added.length > 0 || diff.categoryDiff.removed.length > 0) && (
                    <section className="space-y-2">
                      <h4 className="text-xs font-bold text-stone-400">タグ・カテゴリ変更</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {diff.tagDiff.added.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            {diff.tagDiff.added.map((t) => (
                              <span key={t.id} className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5 text-xs font-bold">
                                <Plus className="w-3 h-3" />{t.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {diff.tagDiff.removed.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-red-600" />
                            {diff.tagDiff.removed.map((t) => (
                              <span key={t.id} className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md px-2 py-0.5 text-xs font-bold">
                                <Minus className="w-3 h-3" />{t.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {diff.categoryDiff.added.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                            {diff.categoryDiff.added.map((c) => (
                              <span key={c.id} className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5 text-xs font-bold">
                                <Plus className="w-3 h-3" />{c.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {diff.categoryDiff.removed.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-red-600" />
                            {diff.categoryDiff.removed.map((c) => (
                              <span key={c.id} className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md px-2 py-0.5 text-xs font-bold">
                                <Minus className="w-3 h-3" />{c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  <DiffViewer lines={bodyLines} />
                </>
              )}

              {/* 凡例 */}
              {diff && (
                <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" />
                    追加行
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm bg-red-50 border border-red-200" />
                    削除行
                  </span>
                </div>
              )}

              {/* スワイプ遷移中のローディングオーバーレイ（古い差分を表示したまま） */}
              {loading && diff && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-b-2xl z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-stone-400 font-bold">読み込み中</span>
                  </div>
                </div>
              )}

              {/* ナビゲーション中のエラー（古い差分を残しつつ通知） */}
              {error && diff && (
                <div className="absolute top-0 left-0 right-0 mx-4 mt-4 z-20">
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-sm">
                    {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
