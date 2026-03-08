#!/bin/sh
set -e
# Next.jsがまだセットアップされていなければ初期化
if [ ! -f /app/next.config.ts ] && [ ! -f /app/next.config.js ] && [ ! -f /app/next.config.mjs ]; then
  echo "📦 First run detected. Initializing Next.js project..."
  # 一時ディレクトリに Next.js プロジェクトを生成（volumeマウントとの競合を回避）
  TMPDIR=$(mktemp -d)
  echo "🚀 Creating Next.js app in temp directory..."
  bun pm cache rm 2>/dev/null || true
  bun create next-app "$TMPDIR/next-app" --typescript --no-eslint --tailwind --src-dir --app --turbopack --no-import-alias --yes
  # 生成されたファイルを /app にコピー（既存のDockerファイル等は上書きしない）
  echo "📁 Copying generated files to /app..."
  cp -rn "$TMPDIR/next-app/"* /app/ 2>/dev/null || true
  cp -rn "$TMPDIR/next-app/".[!.]* /app/ 2>/dev/null || true
  rm -rf "$TMPDIR"
  cd /app
  # 依存パッケージをインストール
  echo "📦 Installing dependencies..."
  bun install
  # Drizzle関連を追加
  echo "📦 Installing Drizzle and database packages..."
  bun add drizzle-orm postgres @supabase/supabase-js
  bun add -d drizzle-kit
  # package.jsonにDB関連スクリプトを追加
  echo "✏️  Adding database scripts..."
  bun run --silent node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = {
      ...pkg.scripts,
      'db:generate': 'drizzle-kit generate',
      'db:push': 'drizzle-kit push',
      'db:studio': 'drizzle-kit studio'
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
  echo "✅ Initialization complete!"
fi
cd /app
# node_modules が存在しなければ依存パッケージをインストール
if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules not found. Installing dependencies..."
  bun install
fi
# 引数があればそれを実行、なければbun dev
if [ $# -eq 0 ]; then
  exec bun dev
else
  exec "$@"
fi