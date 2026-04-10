'use client';

import { Hash } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  toc: TocItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedRootId, setExpandedRootId] = useState<string | null>(null);
  const isInitialRender = useRef(true);
  const navRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rootLevel = useMemo(() => {
    if (toc.some((item) => item.level === 1)) {
      return 1;
    }

    return Math.min(...toc.map((item) => item.level));
  }, [toc]);

  const parentRootById = useMemo(() => {
    const parentMap: Record<string, string> = {};
    let currentRootId: string | null = null;

    for (const item of toc) {
      if (item.level === rootLevel) {
        currentRootId = item.id;
        parentMap[item.id] = item.id;
      } else if (currentRootId) {
        parentMap[item.id] = currentRootId;
      }
    }

    return parentMap;
  }, [toc, rootLevel]);

  if (!toc || toc.length === 0) return null;

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    const rootId = parentRootById[id] ?? id;
    setExpandedRootId(rootId);
    setActiveId(id);

    if (element) {
      // 少し余裕を持ってスクロール (ヘッダー被りなどをJS側でも微調整可能)
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const bindHeadings = () => {
      const headings = toc
        .map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }))
        .filter((item): item is { id: string; element: HTMLElement } => !!item.element);

      cleanup?.();

      if (headings.length === 0) {
        cleanup = undefined;
        return;
      }

      const updateActiveHeading = () => {
        const offset = 120;
        let currentActiveId = headings[0].id;

        for (const heading of headings) {
          const top = heading.element.getBoundingClientRect().top;
          if (top - offset <= 0) {
            currentActiveId = heading.id;
          } else {
            break;
          }
        }

        setActiveId((prev) => (prev === currentActiveId ? prev : currentActiveId));
      };

      updateActiveHeading();
      window.addEventListener('scroll', updateActiveHeading, { passive: true });
      window.addEventListener('resize', updateActiveHeading);

      cleanup = () => {
        window.removeEventListener('scroll', updateActiveHeading);
        window.removeEventListener('resize', updateActiveHeading);
      };
    };

    const handleRendered = () => {
      bindHeadings();
    };

    bindHeadings();
    document.addEventListener('blockviewer:rendered', handleRendered);

    return () => {
      cleanup?.();
      document.removeEventListener('blockviewer:rendered', handleRendered);
    };
  }, [toc]);

  useEffect(() => {
    if (!activeId || !navRef.current) {
      return;
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const activeItem = itemRefs.current[activeId];
    const nav = navRef.current;
    if (!activeItem || !nav) {
      return;
    }

    // scrollIntoView({ block: 'nearest' }) は副作用で
    // コンテナ以外の親（ページ全体など）をスクロールさせることがあるため、
    // scrollTo を使って目次エリア内のみをスクロールさせる
    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    if (itemRect.top < navRect.top || itemRect.bottom > navRect.bottom) {
      const scrollTop = nav.scrollTop;
      const targetTop = activeItem.offsetTop - nav.clientHeight / 2 + activeItem.clientHeight / 2;
      
      nav.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  const activeRootId = activeId ? parentRootById[activeId] ?? activeId : null;
  const visibleRootId = activeRootId ?? expandedRootId;

  return (
    <div className="bg-white border border-stone-200 rounded-[2.5rem] p-9 shadow-sm sticky top-[100px] animate-in fade-in slide-in-from-right-4 duration-500 delay-400">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-xl font-black text-stone-900 tracking-tight">目次</h4>
        <Hash size={18} className="text-stone-300" />
      </div>

      <div className="relative">
        {/* 垂直ガイドライン */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-stone-100" />

        <div
          ref={navRef}
          className="toc-scroll-hidden relative z-10 max-h-[min(60vh,36rem)] overflow-y-auto overflow-x-hidden overscroll-contain pr-1"
        >
          <nav className="min-w-0 space-y-0.5">
          {toc.map((item, i) => {
            const isRoot = item.level === rootLevel;
            const visualLevel = isRoot ? 0 : Math.max(item.level - rootLevel, 0);
            const indentClass =
              visualLevel === 0 ? 'pl-0' : visualLevel === 1 ? 'pl-6' : visualLevel === 2 ? 'pl-10' : 'pl-14';
            const isActive = activeId === item.id;
            const shouldShowTopLevelMarker = isRoot && visibleRootId === item.id;
            const isVisible = isRoot || parentRootById[item.id] === visibleRootId;

            if (!isVisible) {
              return null;
            }

            return (
              <button
                key={i}
                ref={(element) => {
                  itemRefs.current[item.id] = element;
                }}
                onClick={() => handleScroll(item.id)}
                className={`flex w-full min-w-0 items-start gap-4 rounded-xl py-2 text-left transition-all group hover:bg-stone-50/80 ${indentClass} ${
                  isActive ? 'bg-blue-50/70' : ''
                }`}
              >
                {/* ドット要素 */}
                <div className="mt-[7px] relative shrink-0">
                  {isRoot ? (
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white border-2 transition-colors shadow-sm ${
                        shouldShowTopLevelMarker
                          ? 'border-blue-500'
                          : 'border-stone-200 group-hover:border-blue-400'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-2 h-2 ml-0.5 rounded-full border transition-colors ${
                        isActive
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-stone-150 border-stone-200 group-hover:bg-stone-300'
                      }`}
                    />
                  )}
                  {shouldShowTopLevelMarker && (
                    <div className="absolute inset-1 rounded-full bg-blue-500 scale-75" />
                  )}
                </div>

                <span
                  className={`min-w-0 break-words text-[13px] leading-relaxed transition-colors group-hover:text-blue-600 ${
                    isRoot
                      ? isActive
                        ? 'font-bold text-blue-700'
                        : 'font-bold text-stone-800'
                      : isActive
                        ? 'font-semibold text-blue-600'
                        : 'font-medium text-stone-500'
                  }`}
                >
                  {item.text}
                </span>
              </button>
            );
          })}
          </nav>
        </div>
      </div>
    </div>
  );
}
