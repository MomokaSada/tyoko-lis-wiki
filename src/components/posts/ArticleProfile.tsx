import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, Eye, Layers, Box, Tag as TagIcon, Info, ChevronRight, Activity } from 'lucide-react';

interface CategoryPathItem {
  id: number;
  name: string;
}

interface TagItem {
  id: number;
  name: string;
}

export interface ArticleProfileProps {
  postTitle: string;
  postSlug: string;
  viewCount: number;
  latestRevision: number;
  formattedDate: string;
  thumbnailUrl: string | null;
  fallbackThumbnail: string;
  categoryPath: CategoryPathItem[];
  tags: TagItem[];
  isMobile?: boolean;
}

export function ArticleProfile({
  postTitle,
  postSlug,
  viewCount,
  latestRevision,
  formattedDate,
  thumbnailUrl,
  fallbackThumbnail,
  categoryPath,
  tags,
  isMobile = false,
}: ArticleProfileProps) {
  return (
    <div className={`bg-white overflow-hidden ${isMobile
        ? 'rounded-none border-0'
        : 'border border-stone-200 rounded-[2rem] lg:rounded-4xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-right-4 duration-500 delay-300'
      }`}>
      {/* ダークヘッダー */}
      <div className="bg-[#1c1c1c] py-3 text-center border-b border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">項目プロフィール</span>
      </div>

      {/* サムネイル (ヘッダー直下に隙間なく配置) */}
      <div className="relative aspect-video w-full bg-stone-100 border-b border-stone-100">
        <Image
          src={thumbnailUrl || fallbackThumbnail}
          alt={postTitle}
          fill
          sizes="288px"
          className="object-cover"
          unoptimized
        />
      </div>

      {/* コンテンツエリア */}
      <div className="p-6 space-y-8">
        {/* 1. 基本情報 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center shadow-sm text-stone-400 border border-stone-100">
              <Info size={16} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">基本情報</h3>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-stone-900 tracking-tight leading-tight">{postTitle}</h2>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest break-all opacity-60">{postSlug}</p>
          </div>
        </div>

        {/* 2. 履歴 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <History size={14} className="text-stone-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">履歴 / History</h4>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-800">{formattedDate} <span className="text-[10px] text-stone-400 font-normal">第#{latestRevision}版</span></p>
              <p className="text-[10px] text-stone-500 leading-snug">最新のスナップショットが正常に保存されています。</p>
            </div>
          </div>
        </div>

        {/* 3. 情報詳細 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Activity size={14} className="text-stone-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">情報 / Metadata</h4>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm border border-stone-100">
                <Eye size={16} />
              </div>
              <div>
                <p className="text-xs font-black text-stone-800">{viewCount} 回表示</p>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Views</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm border border-stone-100">
                <Layers size={16} />
              </div>
              <div>
                <p className="text-xs font-black text-stone-800">{latestRevision} リビジョン</p>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Version</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. カテゴリ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Box size={14} className="text-stone-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">階層 / Category</h4>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {categoryPath.length > 0 ? (
              categoryPath.map((cat, i) => (
                <span key={cat.id} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={10} className="text-stone-300" />}
                  <Link
                    href={`/posts?categoryId=${cat.id}`}
                    className={`font-black hover:text-blue-600 transition-colors ${i === categoryPath.length - 1 ? 'text-stone-900' : 'text-stone-400'}`}
                  >
                    {cat.name}
                  </Link>
                </span>
              ))
            ) : (
              <span className="text-stone-500 font-bold italic">未設定</span>
            )}
          </div>
        </div>

        {/* 5. タグ */}
        {tags && tags.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <TagIcon size={14} className="text-stone-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">タグ / Tags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/posts?q=${encodeURIComponent(tag.name)}`}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-xl text-[10px] font-black transition-all hover:-translate-y-0.5"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部フッター */}
      <div className="mt-4 pt-6 pb-6 border-t border-stone-100/50 flex justify-center">
        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">tyoko-lis-wiki v1.0</p>
      </div>
    </div>
  );
}
