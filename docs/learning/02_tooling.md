# 02. ツール選定

## ゴール

フロントエンドの「道具箱」を理解する。各カテゴリで**何を選び、なぜそれか、どう組み合わさるか**を押さえる。AI 駆動開発では、AI に「この技術で」と指示するために、人間がこの地図を持っている必要があります。

## ツールの全体地図

| カテゴリ | 選定（ShogiProject） | 役割 | 他言語でいうと |
|----------|---------------------|------|----------------|
| 言語 | **TypeScript** | 型付き JavaScript | 静的型のある言語全般 |
| ビルド/開発サーバー | **Vite** | 開発時の即時反映 + 本番バンドル | ビルドツール（Webpack 後継） |
| 単体テスト | **Vitest** | テスト実行 | pytest / JUnit |
| Lint | **ESLint** | 危ない書き方を検出 | 静的解析器 / linter |
| フォーマッタ | **Prettier** | 書式の自動統一 | black / gofmt |
| API クライアント生成 | **Orval** | OpenAPI から通信コード生成 | OpenAPI Generator |
| API モック | **MSW** | 偽サーバーで通信を横取り | WireMock / responses |
| ダミーデータ | **faker** | 架空データ生成 | Faker 各言語版 |
| UI 部品 | **PrimeVue** | 既製の UI コンポーネント | UI コンポーネントライブラリ |

> 覚え方：**「言語 → ビルド → 品質（テスト/Lint/整形）→ 通信（生成/モック）→ UI」** の順に 1 つずつ選ぶ、と捉えると整理しやすいです。

---

## カテゴリ別の選定理由（要点だけ）

### ビルド：Vite を選ぶ

- 開発時は変更が**即座に画面反映（HMR）**され、待ち時間がほぼない
- 本番は最適化された成果物を出力（`dist/`）
- Vue 公式の雛形が Vite 前提。**迷う理由がない**ので Vite。

### テスト：Vitest を選ぶ

- **Vite の設定をそのまま流用**できる（別途テスト用のビルド設定を書かなくてよい）
- API は pytest/Jest に近く、AI も書きやすい
- ShogiProject では `shogi-board`（盤ロジック）の単体テストに使用

### Lint + フォーマッタ：ESLint + Prettier を「役割分担」させる

ここは初学者が混同しがちなので明確に:

- **ESLint** = *正しさ*の検査（未使用変数、危ない比較、Vue 特有のミスなど）
- **Prettier** = *見た目*の統一（インデント、改行、クォート）

両者は**機能が一部重なる**ため、競合しないよう `eslint-config-prettier` で「整形系のルールは ESLint 側で無効化」します。これは定番の組み合わせで、ShogiProject も採用しています。

### 通信：Orval（生成）+ MSW（モック）+ faker（データ）

この 3 つはセットで「スキーマ駆動」を成立させます。詳細は第 04 章。ここでは「**通信コードは手書きせず生成、サーバーが無くてもモックで動かす**」という方針だけ押さえます。

### UI：PrimeVue（任意）

既製の UI 部品集。必須ではありませんが、ボタン・表・フォームをゼロから作らずに済みます。**学習段階では無くてもよい**ので、この教材のサンプルでは使いません。

---

## 演習：ツールを実際に動かす

第 00 章の `learning-vue` には、雛形生成時にすでに Vite/Vitest/ESLint/Prettier が入っています。**それぞれを起動して挙動を見ます。**

```bash
cd /tmp/learning-vue

# Vite: 開発サーバー（HMR を体験）
npm run dev
#  → 画面を開いたまま src の文言を書き換え、保存すると即反映されるのを見る。Ctrl+C で停止

# ESLint: 静的解析
npm run lint

# Prettier: 整形（--check で差分確認、書き換えはしない）
npm run format
```

> `scripts` の正確な名前は `package.json` を見てください（雛形のバージョンで多少異なります）。`cat package.json` で確認する習慣を。

### わざとエラーを起こして体験する

ESLint の効果を体感するには、未使用変数をわざと作ります。

1. どこかの `.ts` に `const unused = 1` を足す
2. `npm run lint` を実行 → **未使用変数が警告される**のを見る
3. 消すと警告が消える

「AI が書いたコードもこの網にかかる」という安心材料です。

---

## ツールの依存順（ハマりどころ）

ShogiProject のようにパッケージが分かれている場合、**入れる順番**があります。

```bash
# ライブラリ（shogi-board）を先に入れてから
npm ci --prefix shogi-board
# アプリ（shogi-main）を入れる（file:../shogi-board でローカル参照しているため）
npm install --prefix shogi-main
```

> ハマりどころ：アプリがローカルライブラリを参照している場合、**ライブラリを先に用意しないと解決に失敗**します。AI に「セットアップして」と頼むときは、この順序も指示に含めると確実です。
>
> なお上の例で board は `npm ci`・main は `npm install` と**コマンドが混在**しているのは意図的です（`file:` ローカル参照のための使い分け）。理由は [03_commands.md の「`npm install` と `npm ci` の使い分け」](03_commands.md#npm-install-と-npm-ci-の使い分け) で扱います。

---

## ShogiProject ではどうしているか

- `Frontend/README.md` にセットアップ・ビルドのコマンドが集約されている
- `shogi-main/package.json` の `devDependencies` を見ると、本章の選定（Vite/Vitest/ESLint/Prettier/Orval/MSW/faker）が実際に並んでいる
- 加えて `vue-tsc`（`.vue` の型チェック）、`vite-plugin-dts`（ライブラリの型出力）など、**構成特有の補助ツール**も入っている

## この章のまとめ

- ツールは「言語 → ビルド → 品質 → 通信 → UI」の順に 1 カテゴリずつ選ぶ
- ESLint（正しさ）と Prettier（見た目）は**役割分担**
- 通信は Orval/MSW/faker で「生成 + モック」
- 依存の入れる順番に注意

次は [03_commands.md](03_commands.md) で、これらを動かすコマンド運用を整理します。
