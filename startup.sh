#!/bin/sh

# 📦 Azure App Service 用 スタートアップスクリプト
# Next.js standalone ビルドのserver.jsを実行

# 環境変数の設定
export NODE_ENV=production
export PORT=${PORT:-8080}

# 🚀 Next.js standalone サーバーを起動
cd /home/site/wwwroot
node .next/standalone/server.js
