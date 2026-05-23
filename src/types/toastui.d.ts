export {};

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
