# 00. 環境とプロジェクトの作り方

## ゴール

- Vue プロジェクトを**ゼロから生成**できる
- 生成された雛形の「何が選ばれているか」を読み解ける
- 開発サーバーを起動して画面を確認できる

AI 駆動開発でも、**最初の雛形生成と「何を選ぶか」の選択は人間がやる**ことが多い領域です。ここを理解しておくと、AI に「この構成で作って」と正確に指示できます。

## 前提ツール

- **Node.js**（`^20.19.0 || >=22.12.0` 推奨。ShogiProject の `package.json` の `engines` と同じ）
- **npm**（Node に同梱）

確認:

```bash
node -v
npm -v
```

> なぜ Node? Vue のビルドツール（Vite）は Node 上で動きます。ブラウザで動くアプリでも、**開発・ビルドの道具は Node 製**、という構図を最初に押さえてください。

## 演習 1：雛形を生成する

Vue 公式の雛形生成コマンドを使います。**この対話の選択肢が、そのまま「ツール選定」になっている**点に注目してください。

```bash
cd /tmp
npm create vue@latest learning-vue
```

対話で次のように選びます（AI 駆動開発で実用的な構成）。

| 質問 | 選択 | なぜ |
|------|------|------|
| TypeScript | **Yes** | 型は AI が書いたコードの安全網。必須級 |
| JSX | No | Vue では通常テンプレート構文を使う |
| Vue Router | **Yes** | SPA のページ遷移に必要 |
| Pinia（状態管理） | **No**（後述） | まず入れない判断を体験する。第 01 章参照 |
| Vitest（単体テスト） | **Yes** | テストの土台 |
| E2E テスト | No | 今回は対象外 |
| ESLint | **Yes** | Lint の土台 |
| Prettier | **Yes** | フォーマッタ |

> この選択肢こそが「ツール選定」です。第 02 章で各ツールの役割を詳しく見ますが、**雛形生成の時点で主要な選定が終わっている**ことをまず体感してください。ShogiProject も基本この組み合わせ（TypeScript + Router + Vitest + ESLint + Prettier、Pinia なし）です。

## 演習 2：起動する

```bash
cd /tmp/learning-vue
npm install
npm run dev
```

ターミナルに表示された `http://localhost:5173/` をブラウザで開きます。Vue のスタート画面が出れば成功です。

`Ctrl + C` で止められます。

## 生成物を読む（写経しない）

雛形を「読む」ポイントだけ挙げます。覚える必要はありません。「どこに何があるか」だけ掴みます。

```
learning-vue/
├── package.json        # 依存とコマンド（scripts）の定義。最重要
├── vite.config.ts      # ビルドツールの設定
├── tsconfig*.json      # TypeScript の設定
├── eslint.config.js    # Lint の設定
├── index.html          # SPA の唯一の HTML。ここに JS が注入される
└── src/
    ├── main.ts         # アプリの起動点（エントリーポイント）
    ├── App.vue         # ルートコンポーネント
    ├── router/         # ページ遷移の定義
    ├── components/     # 再利用する部品
    └── views/          # 各ページ
```

### 最初に読むべきは `package.json` の `scripts`

```bash
cat package.json
```

`scripts` に並ぶ `dev` / `build` / `test` などが、**あなたが叩くコマンドの実体**です。AI 駆動開発では「どのコマンドがあるか」を把握しておくのが、文法を覚えるより重要です（第 03 章で詳述）。

## ShogiProject ではどうしているか

ShogiProject は雛形をそのまま 1 アプリにするのではなく、**役割で 3 パッケージに分割**しています。

- `shogi-board/` … 将棋盤 UI を**ライブラリ**として切り出し
- `shogi-main/` … アプリ本体
- `shogi-board-test/` … 盤ライブラリの動作確認用

この「ライブラリとアプリを分ける」判断は第 01 章で扱います。まずは「1 つの雛形 = 1 アプリ」から始めれば十分です。

## この章のまとめ

- 雛形生成（`npm create vue`）の**対話の選択肢が、そのまま技術選定**になっている
- AI 駆動開発でも、構成の選択と起動確認は人間がやる
- 最初に読むのは `package.json` の `scripts`

次は [01_architecture.md](01_architecture.md) で、「Composition API を使う」「Pinia を入れない」といった**大方針レベルの判断**を扱います。
