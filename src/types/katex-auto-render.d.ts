declare module 'katex/contrib/auto-render' {
  export interface RenderMathInElementDelimiter {
    left: string;
    right: string;
    display: boolean;
  }

  export interface RenderMathInElementOptions {
    delimiters?: RenderMathInElementDelimiter[];
    throwOnError?: boolean;
    strict?: boolean | string;
    ignoredTags?: string[];
  }

  export default function renderMathInElement(
    element: HTMLElement,
    options?: RenderMathInElementOptions,
  ): void;
}
