# Frontend

将棋棋譜管理アプリのフロントエンド。Vue 3 SPA。

## 構成

- `shogi-board/` - 将棋盤ライブラリ（shogi-main から `file:../shogi-board` で参照）
- `shogi-main/` - メインアプリケーション
- `docs/` - OpenAPI 定義（親リポジトリから `docs/sync.sh` でコピー）

## セットアップ

```bash
# OpenAPI 定義を同期（親リポジトリのルートから実行）
bash docs/sync.sh

# 依存インストール（shogi-board が先）
npm ci --prefix shogi-board
npm install --prefix shogi-main
```

## 開発

```bash
# shogi-main の開発サーバー起動（API 自動生成 + Vite dev server）
npm run dev --prefix shogi-main
```

## ビルド

```bash
# API コード生成 + 型チェック + 本番ビルド
npm run build --prefix shogi-main

# 成果物は shogi-main/dist/ に出力される
```

## API コード生成

OpenAPI 定義から API クライアントを自動生成する（orval）。

```bash
npm run generate:api --prefix shogi-main
```

`docs/openapi_main.yaml` と `docs/openapi_analysis.yaml` を参照するため、
事前に `docs/sync.sh` で同期しておくこと。
