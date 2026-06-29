import { cache } from 'react';
import { createHeadingIdBase, createUniqueHeadingId, normalizeHeadingText } from '@/lib/heading';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Zenn風の高度な目次抽出ツール
 * H1 (#) 〜 H4 (####) に対応
 */
function extractTocImpl(markdown: string): TocItem[] {
  if (!markdown) return [];
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  // コードブロックをスキップしつつ見出しを抽出する正規表現
  // 1. ``` で囲まれたブロックを最短一致でマッチさせて無視
  // 2. 改行直後の # (1-6個) で始まる行を抽出
  const regex = /^(?:```[\s\S]*?^```|^\s*(#{1,6})\s*(.+?)\s*$)/gm;

  let match;
  while ((match = regex.exec(markdown)) !== null) {
    // match[1] が存在する場合のみ見出しとして処理（コードブロックは無視）
    if (match[1]) {
      const level = match[1].length;
      const text = normalizeHeadingText(match[2]);
      if (text) {
        const id = createUniqueHeadingId(createHeadingIdBase(text), usedIds);
        toc.push({ id, text, level });
      }
    }
  }

  return toc;
}

export const extractToc = cache(extractTocImpl);
