'use client';

import { useEffect, useRef, useState } from 'react';

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

declare global {
  interface Window {
    toastui?: {
      Editor: (new (options: Record<string, unknown>) => ToastUiEditorInstance) & {
        factory?: (options: {
          el: HTMLElement;
          viewer: boolean;
          initialValue: string;
        }) => {
          destroy?: () => void;
        };
      };
    };
  }
}

const TOASTUI_SCRIPT_ID = 'toastui-editor-script';
const TOASTUI_CSS_ID = 'toastui-editor-css';

function ensureToastUiAssets() {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('document is not available'));
  }

  const existingScript = document.getElementById(TOASTUI_SCRIPT_ID) as HTMLScriptElement | null;
  const existingCss = document.getElementById(TOASTUI_CSS_ID) as HTMLLinkElement | null;

  if (!existingCss) {
    const css = document.createElement('link');
    css.id = TOASTUI_CSS_ID;
    css.rel = 'stylesheet';
    css.href = '/vendor/toastui/toastui-editor.min.css';
    document.head.appendChild(css);
  }

  if (window.toastui?.Editor) {
    return Promise.resolve(window.toastui);
  }

  if (existingScript) {
    return new Promise<typeof window.toastui>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.toastui), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Toast UI Editor script failed to load')), { once: true });
    });
  }

  return new Promise<typeof window.toastui>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TOASTUI_SCRIPT_ID;
    script.src = '/vendor/toastui/toastui-editor-all.min.js';
    script.async = true;
    script.onload = () => resolve(window.toastui);
    script.onerror = () => reject(new Error('Toast UI Editor script failed to load'));
    document.body.appendChild(script);
  });
}

async function uploadInlineImage(blob: Blob | File) {
  const formData = new FormData();
  formData.append('file', blob);

  const response = await fetch('/api/uploads/thumbnail', {
    method: 'POST',
    body: formData,
  });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? '画像アップロードに失敗しました');
  }

  return data.url;
}

export default function BlockEditor({
  initialMarkdown,
  name = 'content',
}: {
  initialMarkdown: string;
  name?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastUiEditorInstance | null>(null);
  const initializedRef = useRef(false);
  const initRequestIdRef = useRef(0);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModeSwitch] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get('coder') === 'true';
  });

  useEffect(() => {
    let disposed = false;
    const requestId = ++initRequestIdRef.current;

    async function init() {
      if (!mountRef.current || initializedRef.current) {
        return;
      }

      try {
        const toastui = await ensureToastUiAssets();

        if (disposed || !mountRef.current || !toastui?.Editor || requestId !== initRequestIdRef.current) {
          return;
        }

        // Keep a stable host node and avoid manual DOM clears during teardown.
        // Toast UI manages its internal subtree and can throw when external code mutates it mid-destroy.
        mountRef.current.replaceChildren();

        const editor = new toastui.Editor({
          el: mountRef.current,
          height: '100%',
          initialEditType: 'wysiwyg',
          previewStyle: 'tab',
          hideModeSwitch: !showModeSwitch,
          initialValue: initialMarkdown,
          usageStatistics: false,
          autofocus: false,
          placeholder: '本文を入力してください',
        });

        editor.on('change', () => {
          setMarkdown(editor.getMarkdown());
        });

        if (editor.addHook) {
          editor.addHook('addImageBlobHook', async (blob: Blob | File, callback: (url: string, text?: string) => void) => {
            try {
              const url = await uploadInlineImage(blob);
              callback(url, 'uploaded-image');
            } catch (error) {
              console.error(error);
            }
          });
        }

        if (disposed || requestId !== initRequestIdRef.current) {
          try {
            editor.destroy();
          } catch (error) {
            console.error(error);
          }
          return;
        }

        editorRef.current = editor;
        initializedRef.current = true;
        setMarkdown(editor.getMarkdown());
        setStatus('ready');
      } catch (error) {
        console.error(error);
        if (!disposed && requestId === initRequestIdRef.current) {
          setStatus('error');
          setErrorMessage(
            error instanceof Error ? error.message : 'エディタの初期化に失敗しました',
          );
        }
      }
    }

    init();

    return () => {
      disposed = true;
      const editor = editorRef.current;
      editorRef.current = null;
      initializedRef.current = false;

      if (editor) {
        try {
          editor.destroy();
        } catch (error) {
          console.error(error);
        }
      }
    };
  }, [initialMarkdown, showModeSwitch]);

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white shadow-sm transition-colors focus-within:border-amber-400 overflow-hidden">
      <input type="hidden" name={name} value={markdown} />

      <div className="relative h-[calc(100vh-6rem)] min-h-[800px]">
        {status === 'loading' ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white text-sm text-stone-500">
            エディタを読み込み中...
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white px-6 text-center">
            <p className="text-sm font-semibold text-red-600">エディタを起動できませんでした</p>
            <p className="text-xs text-stone-500">{errorMessage}</p>
          </div>
        ) : null}

        <div ref={mountRef} className="toastui-host h-full" />
      </div>
    </div>
  );
}
