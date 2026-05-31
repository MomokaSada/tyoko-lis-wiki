export type ToastUiEditorInstance = {
  getMarkdown: () => string;
  setMarkdown: (value: string, cursorToEnd?: boolean) => void;
  on: (event: string, handler: () => void) => void;
  off?: (event: string, handler?: () => void) => void;
  removeHook?: (name: string) => void;
  addHook?: (
    name: string,
    handler: (blob: Blob | File, callback: (url: string, text?: string) => void) => void,
  ) => void;
  exec: (command: string, payload?: Record<string, unknown>) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    toastui?: {
      Editor: (new (options: Record<string, unknown>) => ToastUiEditorInstance) & {
        setLanguage?: (codes: string[] | string, dict: Record<string, string>) => void;
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
