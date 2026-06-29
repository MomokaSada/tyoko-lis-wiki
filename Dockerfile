# 本番ビルドの再現性を確保するため latest ではなく明示的なバージョンタグを使用
# 更新頻度は Renovate / Dependabot に任せる
FROM oven/bun:1.2
WORKDIR /app

# 起動スクリプトをコピー
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]