# 03. コマンド運用

## ゴール

AI 駆動開発では、**コードより先にコマンドを覚える**ほうが実用的です。AI がコードを書き、人間がコマンドを叩いて確認する、という分業になるからです。この章では「どのコマンドを、いつ、なぜ叩くか」を整理します。

## コマンドはすべて `package.json` の `scripts` 由来

`npm run xxx` の `xxx` は、`package.json` の `scripts` に定義された名前です。**まず `scripts` を読む**のが鉄則。

```bash
cat package.json   # scripts セクションを見る
```

`npm run` だけ打つと、定義済みコマンド一覧が出ます（覚えていなくても確認できる）。

```bash
npm run
```

---

## 基本の 5 コマンド

| コマンド | 何をする | いつ叩く |
|----------|----------|----------|
| `npm install` / `npm ci` | 依存をインストール（使い分けは後述） | 最初・依存追加時 |
| `npm run dev` | 開発サーバー起動（HMR） | **開発中ずっと** |
| `npm run build` | 本番用ビルド | デプロイ前・最終確認 |
| `npm run test` | 単体テスト | ロジック変更後 |
| `npm run lint` | 静的解析 | コミット前 |

---

## `npm install` と `npm ci` の使い分け

依存インストールには 2 つのコマンドがあり、**どちらを使うかは運用上の判断**です。AI 駆動でも「セットアップして」と頼む前に人間が方針を持つべき箇所なので、独立して扱います。

### 何が違うのか

両者の差は「**`package.json` と `package-lock.json` のどちらを正とするか**」です。

| | `npm install` | `npm ci` |
|---|---|---|
| 何を正とする | `package.json` を起点に解決 | `package-lock.json` に**厳密一致** |
| lockfile | 必要なら**書き換える** | **読むだけ・書き換えない** |
| ズレたとき | 黙って合わせて続行 | **エラーで止まる** |
| node_modules | 差分更新 | **全消ししてクリーン再構築** |
| 主な用途 | 開発中・依存を足すとき | CI・再現性を固めたいとき |

> 一言で：`install` は「**柔軟・続行優先**」、`ci` は「**厳密・再現優先（違うなら失敗しろ）**」。`ci` は lockfile を絶対の正とするので、チームや CI で**全員が寸分違わず同じものを入れる**ことを保証できます。

### 基本方針

- **CI・本番ビルド・安定した依存** → `npm ci`（再現性を固める）
- **開発中・依存を追加/変更するとき** → `npm install`（lockfile を更新しながら解決）

迷ったら「**他人や CI と完全に同じ状態を作りたいなら `ci`、自分が依存をいじる作業中なら `install`**」。

### ハマりどころ：ローカルパッケージ参照があると `ci` が失敗しうる

ShogiProject はここで使い分けが「ねじれて」見えます。

```bash
npm ci      --prefix shogi-board   # ライブラリは ci
npm install --prefix shogi-main    # アプリは install
```

理由は、**`shogi-main` が `shogi-board` を `file:../shogi-board` でローカル参照している**こと。

- `shogi-board`（外部依存のみ）は lockfile が安定 → **再現性重視で `ci`**
- `shogi-main` はローカル参照のため、`shogi-board` をビルド・更新すると lockfile と解決結果が**ズレることがある**。その状態で `ci`（厳密一致）を使うと**毎回失敗**しかねない → **寛容な `install` に逃がす**

> 注意：「両方 `install` でも動く」。`ci` にしているのは禁止回避ではなく**再現性のための選択**です。`file:` ローカル参照や workspace を含む構成では、`ci` が厳密一致で落ちやすい、という性質だけ覚えておけば使い分けに迷いません。

---

## 典型的なワークフロー

### 日々の開発ループ

```bash
npm run dev      # 起動しっぱなしにして、AI にコードを書かせながら画面で確認
```

`dev` を起動したまま、別ターミナルで AI にコードを書かせます。保存するたび画面が即更新（HMR）されるので、**コードを書く → 即見る → 直す**のループが速く回ります。

### コミット前チェック

```bash
npm run lint     # 正しさ
npm run format   # 整形（または format:check で差分だけ確認）
npm run test     # テスト
npm run build    # 本番ビルドが通るか（型エラーはここで出ることが多い）
```

> ベストプラクティス：**`build` まで通して初めて「動く」とみなす**。`dev` は通っても `build`（型チェック込み）で落ちることがあります。AI に「実装して」と頼んだ後は、必ず `build` まで人間が確認しましょう。

---

## スキーマ駆動特有のコマンド：`generate:api`

ShogiProject のような OpenAPI ベースの構成では、**API クライアントを生成するコマンド**が増えます。

```bash
npm run generate:api   # OpenAPI 定義から通信コード・型・モックを生成（Orval）
```

注目すべきは、ShogiProject の `dev` / `build` が**内部でこれを自動実行**している点です。

```jsonc
// shogi-main/package.json（抜粋）
"dev": "npm run generate:api && vite",
"build": "npm run generate:api && run-p type-check \"build-only {@}\" --",
```

> なぜ自動実行？ OpenAPI を変えたのに生成を忘れる、という事故を防ぐためです。`dev`/`build` の頭で必ず再生成することで、**コードと API 契約が常に同期**します。第 04 章で詳しく扱います。

ここで使われる `run-p`（`npm-run-all2`）は「複数の npm スクリプトを**並列**実行」する道具です（`run-s` なら直列）。型チェックとビルドを同時に走らせて速くしています。

---

## `--prefix` でパッケージを指定する

ShogiProject はパッケージが複数あるため、**どのパッケージのコマンドかを `--prefix` で指定**します。

```bash
# shogi-main の開発サーバーを起動
npm run dev --prefix shogi-main

# shogi-board のテストを実行
npm run test --prefix shogi-board
```

> ルート直下で全部やろうとして「scripts が無い」と言われたら、`--prefix` の付け忘れか、対象パッケージ違いを疑ってください。

---

## 演習：コマンドを一通り叩く

第 00 章の `learning-vue` で、開発ループとコミット前チェックを実際に回します。

```bash
cd /tmp/learning-vue

# 1. 一覧を確認
npm run

# 2. 開発サーバー（別ターミナル推奨。確認したら Ctrl+C）
npm run dev

# 3. コミット前チェックを順に
npm run lint
npm run test
npm run build
```

`build` が成功すると `dist/`（本番成果物）が生成されます。`ls dist` で中身を覗いてみてください。**これがサーバーに配置される最終形**です。

---

## ShogiProject ではどうしているか

- `Frontend/README.md` にセットアップ〜ビルドのコマンドが集約
- `dev`/`build` が `generate:api` を内包し、**API 契約との同期を強制**
- パッケージ分割のため `--prefix` を多用

## この章のまとめ

- コマンドの実体は `package.json` の `scripts`。まずそこを読む
- 基本は `dev`（開発）→ `lint`/`test`/`build`（確認）
- **`build` が通って初めて「動く」**。AI 実装後は必ず確認
- スキーマ駆動では `generate:api` が `dev`/`build` に組み込まれている
- 依存インストールは **CI/再現は `ci`・開発/依存変更は `install`**。`file:` ローカル参照があると `ci` は失敗しうる

次は [04_schema_driven.md](04_schema_driven.md) で、その `generate:api`（Orval）とモック（MSW）を体験します。
