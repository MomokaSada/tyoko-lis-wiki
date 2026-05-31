import { type Metadata } from 'next';
import { Heading1, Bold, Italic, List, ListOrdered, Link, Image, Code, Table, Quote, FileText, Eye, Edit3 } from 'lucide-react';

/**
 * Markdownアイコン（lucide-react v1.7.0 に未収録のためカスタムSVGで提供）
 * ドキュメントに "M↓" が描かれた、Markdownを象徴するアイコン
 */
function MarkdownIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* ドキュメントの輪郭 */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* M↓ マークダウン記号 */}
      <path d="M8 15l2-2 2 2" />
      <path d="M12 13v4" />
      <path d="M8 11h8" />
      <path d="M8 11l2 2" />
      <path d="M16 11l-2 2" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'Markdownエディタの使い方 | ちょこちょこ大百科',
  description: 'ちょこちょこ大百科の記事作成で使用できるMarkdownエディタ（MDツール）の使い方を詳しく解説します。基本的な記法から便利な機能まで網羅。',
};

const syntaxExamples = [
  {
    title: '見出し',
    icon: Heading1,
    description: '文章の構造を示す見出しは、# の数でレベルを指定します。',
    code: `# 見出し1（大見出し）
## 見出し2（中見出し）
### 見出し3（小見出し）`,
    preview: (
      <div className="space-y-1">
        <p className="text-lg font-black text-stone-800">見出し1</p>
        <p className="text-base font-bold text-stone-700">見出し2</p>
        <p className="text-sm font-semibold text-stone-600">見出し3</p>
      </div>
    ),
  },
  {
    title: '太字 / 斜体 / 打ち消し線',
    icon: Bold,
    description: 'テキストを強調したいときに使います。',
    code: `**太字テキスト**
*斜体テキスト*
~~打ち消し線~~`,
    preview: (
      <div className="space-y-1 text-sm">
        <p><strong className="font-bold text-stone-800">太字テキスト</strong></p>
        <p><em className="italic text-stone-700">斜体テキスト</em></p>
        <p><span className="line-through text-stone-500">打ち消し線</span></p>
      </div>
    ),
  },
  {
    title: 'リスト',
    icon: List,
    description: '箇条書きと番号付きリストが使えます。',
    code: `- 箇条書きアイテム
- 箇条書きアイテム
  - ネストも可能

1. 番号付きアイテム
2. 番号付きアイテム`,
    preview: (
      <div className="space-y-1 text-sm text-stone-700">
        <ul className="list-disc list-inside">
          <li>箇条書きアイテム</li>
          <li>箇条書きアイテム</li>
        </ul>
        <ol className="list-decimal list-inside">
          <li>番号付きアイテム</li>
          <li>番号付きアイテム</li>
        </ol>
      </div>
    ),
  },
  {
    title: 'リンク',
    icon: Link,
    description: 'テキストにリンクを設定できます。',
    code: `[表示テキスト](https://example.com)`,
    preview: (
      <p className="text-sm text-amber-700 underline underline-offset-2 decoration-amber-300">
        表示テキスト
      </p>
    ),
  },
  {
    title: '画像',
    icon: Image,
    description: '記事に画像を埋め込めます。エディタから直接アップロードも可能です。',
    code: `![画像の代替テキスト](画像URL)`,
    preview: (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Image size={16} />
        <span>画像を埋め込む</span>
      </div>
    ),
  },
  {
    title: 'コード',
    icon: Code,
    description: 'コードスニペットを綺麗に表示できます。',
    code: "```javascript\nconsole.log('Hello!');\n```\n\nまたは `インラインコード`",
    preview: (
      <div className="space-y-1">
        <div className="bg-stone-900 text-stone-200 text-xs rounded-lg p-3 font-mono">
          console.log(&apos;Hello!&apos;);
        </div>
        <p><code className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-xs font-mono">インラインコード</code></p>
      </div>
    ),
  },
  {
    title: '引用',
    icon: Quote,
    description: '引用文を強調表示します。',
    code: `> 引用文をここに記述します。
> 複数行にも対応しています。`,
    preview: (
      <blockquote className="border-l-3 border-stone-300 bg-stone-50 pl-4 py-2 text-sm text-stone-600 italic rounded-r-lg">
        引用文をここに記述します。
      </blockquote>
    ),
  },
  {
    title: '表（テーブル）',
    icon: Table,
    description: 'データを表形式で整理できます。',
    code: `| ヘッダー1 | ヘッダー2 |
|----------|----------|
| セル1    | セル2    |`,
    preview: (
      <table className="text-xs border-collapse">
        <thead>
          <tr className="bg-stone-100">
            <th className="border border-stone-200 px-3 py-1.5 font-bold">ヘッダー1</th>
            <th className="border border-stone-200 px-3 py-1.5 font-bold">ヘッダー2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-stone-200 px-3 py-1.5">セル1</td>
            <td className="border border-stone-200 px-3 py-1.5">セル2</td>
          </tr>
        </tbody>
      </table>
    ),
  },
];

const editorFeatures = [
  {
    icon: Edit3,
    title: 'WYSIWYG編集',
    description: '見たまま編集モードに対応。リッチテキストエディタのように直感的に記事を作成できます。',
  },
  {
    icon: Eye,
    title: 'プレビュー機能',
    description: '編集中にリアルタイムでプレビューを確認できます。仕上がりを確認しながら執筆可能です。',
  },
  {
    icon: FileText,
    title: 'Markdown直接編集',
    description: 'Markdownソースを直接編集することも可能。URLパラメータに `?coder=true` を付けるとモード切替が表示されます。',
  },
  {
    icon: Image,
    title: '画像インラインアップロード',
    description: 'エディタ内に画像をドラッグ＆ドロップまたは貼り付けるだけで、自動的にアップロードして埋め込みます。',
  },
  {
    icon: Table,
    title: '表組みエディタ',
    description: 'ツールバーから表を挿入でき、行や列の追加・削除も簡単に行えます。',
  },
  {
    icon: Code,
    title: 'コードシンタックスハイライト',
    description: 'コードブロックはシンタックスハイライトに対応。プログラミング言語を指定して綺麗に表示できます。',
  },
];

export default function MarkdownGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* ── Hero ── */}
      <div className="mb-10 md:mb-14">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-700 shadow-sm">
            <MarkdownIcon size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Guide</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 tracking-tighter">
              Markdownエディタの使い方
            </h1>
          </div>
        </div>
        <p className="text-stone-500 text-sm sm:text-base leading-relaxed max-w-2xl">
          ちょこちょこ大百科の記事作成には <strong className="font-bold text-stone-700">Markdown（マークダウン）</strong> 記法に対応したリッチエディタを採用しています。
          このページでは、エディタの基本的な使い方から、Markdownの記法までを詳しく解説します。
        </p>
      </div>

      {/* ── エディタの概要 ── */}
      <section className="mb-12">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
            <Edit3 size={20} className="text-amber-600" />
            エディタについて
          </h2>
          <div className="space-y-3 text-stone-600 text-sm sm:text-base leading-relaxed">
            <p>
              記事投稿で使用するエディタは <strong className="font-bold text-stone-700">Toast UI Editor</strong> をベースにした高機能なMarkdownエディタです。
              ツールバーから直感的に書式を適用できる <strong className="font-bold text-stone-700">WYSIWYGモード</strong> と、
              ソースを直接記述できる <strong className="font-bold text-stone-700">Markdownモード</strong> の2つの編集モードを備えています。
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-900 text-sm">
              <p className="font-bold mb-1">📝 編集画面へのアクセス</p>
              <p>
                編集権限を持つユーザーは、画面上部の「項目を作成」ボタンから新しい記事を作成できます。
                また、各記事の詳細ページからも編集リンクを通じて編集画面にアクセスできます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── エディタの機能 ── */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-stone-800 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
          エディタの主な機能
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editorFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-3">
                <feature.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-stone-800 mb-1.5">{feature.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Markdown 記法ガイド ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
            Markdown記法ガイド
          </h2>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">基本編</span>
        </div>

        <div className="space-y-5">
          {syntaxExamples.map((syntax) => (
            <div
              key={syntax.title}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:border-stone-300 transition-colors"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600">
                    <syntax.icon size={15} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">{syntax.title}</h3>
                </div>
                <p className="text-xs text-stone-500 mb-4">{syntax.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* コード例 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">記述例</span>
                    </div>
                    <pre className="bg-stone-900 text-stone-200 text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
                      <code>{syntax.code}</code>
                    </pre>
                  </div>
                  {/* 表示結果 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">表示結果</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 min-h-[80px] flex items-center">
                      {syntax.preview}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 便利なショートカット ── */}
      <section className="mb-12">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
            キーボードショートカット
          </h2>
          <div className="overflow-hidden rounded-xl border border-stone-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">ショートカット</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">動作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { key: 'Ctrl + B', action: '太字' },
                  { key: 'Ctrl + I', action: '斜体' },
                  { key: 'Ctrl + Shift + S', action: '打ち消し線' },
                  { key: 'Ctrl + Alt + H', action: '見出しレベルの変更' },
                  { key: 'Ctrl + Shift + K', action: 'コードブロックの挿入' },
                  { key: 'Ctrl + Shift + I', action: '画像の挿入' },
                  { key: 'Ctrl + K', action: 'リンクの挿入' },
                  { key: 'Tab / Shift + Tab', action: 'インデント / アウトデント' },
                ].map(({ key, action }) => (
                  <tr key={key} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <kbd className="px-2 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-700 shadow-sm">
                        {key}
                      </kbd>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-600">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Tips ── */}
      <section className="mb-12">
        <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
            💡 活用のヒント
          </h2>
          <ul className="space-y-3 text-sm text-stone-600">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-bold shrink-0 mt-0.5">1</span>
              <span><strong className="font-bold text-stone-700">画像はドラッグ＆ドロップ</strong>で手軽にアップロード。記事に直接埋め込めます。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-bold shrink-0 mt-0.5">2</span>
              <span><strong className="font-bold text-stone-700">数式（LaTeX）</strong>にも対応。KaTeXを使って美しい数式を記述できます。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-bold shrink-0 mt-0.5">3</span>
              <span><strong className="font-bold text-stone-700">Markdownモード</strong>とWYSIWYGモードはタブで切り替え可能（URLに <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">?coder=true</code> を追加）。</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Footer Note ── */}
      <div className="text-center border-t border-stone-100 pt-8">
        <p className="text-xs text-stone-400">
          このガイドに関する質問や改善提案はdiscordの専用チャンネルからお知らせください。
        </p>
      </div>
    </div>
  );
}
