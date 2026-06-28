'use client';

import { useEffect, useRef } from 'react';
import { createHeadingIdBase, createUniqueHeadingId, normalizeHeadingText } from '@/lib/heading';

type ToastUiEditorInstance = {
  getMarkdown: () => string;
  setMarkdown: (value: string, cursorToEnd?: boolean) => void;
  on: (event: string, handler: () => void) => void;
  removeHook?: (name: string) => void;
  addHook?: (
    name: string,
    handler: (blob: Blob | File, callback: (url: string, text?: string) => void) => void,
  ) => void;
  destroy: () => void;
};

const TOASTUI_STYLE_ID = 'toastui-viewer-style';
const TOASTUI_STYLE_HREF = '/vendor/toastui/toastui-editor.min.css';
const TOASTUI_SCRIPT_ID = 'toastui-viewer-script';
const TOASTUI_SCRIPT_SRC = '/vendor/toastui/toastui-editor-all.min.js';

type RenderMathInElement = (
  element: HTMLElement,
  options?: {
    delimiters?: { left: string; right: string; display: boolean }[];
    throwOnError?: boolean;
    strict?: boolean | string;
    ignoredTags?: string[];
  },
) => void;

let mathRendererPromise: Promise<RenderMathInElement | null> | null = null;

async function loadMathRenderer() {
  if (!mathRendererPromise) {
    mathRendererPromise = import('katex/contrib/auto-render')
      .then((module) => module.default as RenderMathInElement)
      .catch(() => null);
  }

  return mathRendererPromise;
}

function normalizeMarkdownForViewer(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const normalized: string[] = [];
  let isInCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
      normalized.push(line);
      continue;
    }

    if (
      !isInCodeBlock &&
      /^([-*_])(?:\s*\1){2,}$/.test(trimmed) &&
      normalized.length > 0 &&
      normalized[normalized.length - 1].trim() !== ''
    ) {
      normalized.push('');
    }

    normalized.push(line);
  }

  return normalized.join('\n');
}

function wrapTables(container: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  container.querySelectorAll('table').forEach((table) => {
    // 既にラップ済みの場合はスキップ
    if (table.parentElement?.classList.contains('table-scroll-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll-wrapper';
    table.parentElement?.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    // スクロール位置に応じて左/右のフェードシャドウを切り替え、
    // ユーザーに「横にスクロールできる」ことを視覚的に伝える
    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = wrapper;
      const maxScroll = scrollWidth - clientWidth;

      // 横スクロールが不要なときは hint クラス自体を外す (フェードなし)
      if (maxScroll <= 0) {
        wrapper.classList.remove('is-scrollable');
        wrapper.classList.remove('is-scrolled-left');
        wrapper.classList.remove('is-scrolled-right');
        return;
      }

      wrapper.classList.add('is-scrollable');

      if (scrollLeft <= 4) {
        wrapper.classList.remove('is-scrolled-left');
      } else {
        wrapper.classList.add('is-scrolled-left');
      }

      if (scrollLeft >= maxScroll - 4) {
        wrapper.classList.remove('is-scrolled-right');
      } else {
        wrapper.classList.add('is-scrolled-right');
      }
    };

    // 初期反映
    updateShadows();

    wrapper.addEventListener('scroll', updateShadows, { passive: true });

    const onResize = () => updateShadows();
    window.addEventListener('resize', onResize, { passive: true });

    cleanups.push(() => {
      wrapper.removeEventListener('scroll', updateShadows);
      window.removeEventListener('resize', onResize);
    });

    // 画像の遅延読み込みや KaTeX などの非同期レンダリングで
    // テーブル内のコンテンツ幅が変動しうるため、念のため再計算を 1 回行う
    requestAnimationFrame(updateShadows);
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}

function normalizeRenderedContent(container: HTMLElement) {
  const usedIds = new Map<string, number>();
  container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const text = normalizeHeadingText(heading.textContent ?? '');
    if (!text) {
      return;
    }

    const id = createUniqueHeadingId(createHeadingIdBase(text), usedIds);
    heading.id = id;
  });

  container.querySelectorAll<HTMLElement>('code').forEach((code) => {
    if (code.closest('pre')) {
      return;
    }

    const text = code.textContent?.trim();
    const match = text?.match(/^(`+)([\s\S]*?)\1$/);

    if (match) {
      code.textContent = match[2];
    }
  });
}

async function renderMath(container: HTMLElement) {
  const renderMathInElement = await loadMathRenderer();
  if (!renderMathInElement) {
    return;
  }

  renderMathInElement(container, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
    strict: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  });
}

function ensureStylesheet(id: string, href: string) {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function ensureScript(id: string, src: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;

  if (existing?.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function BlockViewer({ markdown }: { markdown: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let viewerInstance: { destroy?: () => void } | null = null;
    let releaseTableWrappers: (() => void) | null = null;

    const initializeViewer = async () => {
      ensureStylesheet(TOASTUI_STYLE_ID, TOASTUI_STYLE_HREF);
      await ensureScript(TOASTUI_SCRIPT_ID, TOASTUI_SCRIPT_SRC);

      if (cancelled || !mountRef.current || !window.toastui?.Editor?.factory) {
        return;
      }

      mountRef.current.innerHTML = '';

      viewerInstance = window.toastui.Editor.factory({
        el: mountRef.current,
        viewer: true,
        initialValue: normalizeMarkdownForViewer(markdown),
      });

      requestAnimationFrame(async () => {
        if (cancelled || !mountRef.current) {
          return;
        }

        normalizeRenderedContent(mountRef.current);
        releaseTableWrappers = wrapTables(mountRef.current);
        await renderMath(mountRef.current);

        if (cancelled) {
          return;
        }

        document.dispatchEvent(new CustomEvent('blockviewer:rendered'));
      });
    };

    initializeViewer().catch(() => {
      if (!mountRef.current) {
        return;
      }

      mountRef.current.innerHTML = '';
      const fallback = document.createElement('pre');
      fallback.className = 'overflow-x-auto rounded-3xl bg-stone-950 p-6 text-sm leading-7 text-stone-100';
      fallback.textContent = markdown;
      mountRef.current.appendChild(fallback);
    });

    return () => {
      cancelled = true;

      try {
        releaseTableWrappers?.();
      } catch (error) {
        console.error(error);
      }

      try {
        viewerInstance?.destroy?.();
      } catch (error) {
        console.error(error);
      }

      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [markdown]);

  return <div ref={mountRef} className="article-viewer min-w-0" />;
}
