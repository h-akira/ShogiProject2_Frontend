# 01. 設計の大方針

## ゴール

AI に書かせる前に人間が決める「大方針レベルの判断」を理解する。具体的には:

- **Composition API** を使う（Options API ではなく）
- **状態管理ライブラリ（Pinia）を安易に入れない**判断
- **ライブラリとアプリを分ける**判断

これらは文法ではなく**設計の選択**です。AI は指示すればどちらでも書けるので、**人間がどちらを選ぶかを決めて指示する**必要があります。

---

## 判断 1：Composition API を使う

Vue にはコンポーネントの書き方が 2 系統あります。

| 方式 | どんなもの | 今選ぶべきか |
|------|-----------|-------------|
| **Options API** | `data` / `methods` / `computed` をオブジェクトの決まった場所に書く旧来の方式 | ❌ 新規では非推奨寄り |
| **Composition API** | `ref` / `computed` などの関数を使い、ロジックを自由に組み立てる現行方式 | ✅ これを使う |

### なぜ Composition API か（経験者向けの説明）

- **ロジックを関数として切り出して再利用できる**（後述の Composable）。他言語の「関数・フック」に近い発想で、Options API の「決められた場所に書く」制約から解放される。
- **TypeScript との相性が良い**。型推論が効きやすく、AI が書いたコードも型エラーで守りやすい。
- 公式・エコシステムの推奨が Composition API に寄っている。**AI に学習データが多く、生成精度が高い**のもこちら。

### AI への指示の例

```
（良い指示）Vue 3 の Composition API（<script setup>）で、〜するコンポーネントを書いて
（曖昧な指示）Vue でコンポーネント書いて   ← Options API が混ざることがある
```

> ポイント：方式を明示しないと、AI は学習データに引きずられて Options API を混ぜることがあります。**「Composition API で」と毎回言う**か、後述の `CLAUDE.md` / ルールファイルに明記しておくのがベストプラクティスです。

---

## 判断 2：状態管理ライブラリを「入れない」

React の Redux に相当する Vue の状態管理ライブラリが **Pinia**（旧 Vuex）です。多くの入門記事が「とりあえず Pinia」と勧めますが、**安易に入れないのが今のベストプラクティス**です。

### 状態管理の選択肢は 3 段階ある

| 段階 | 手段 | 使いどころ |
|------|------|-----------|
| 1. コンポーネント内 | `ref` / `computed` | その画面だけで完結する状態（フォーム入力など） |
| 2. 関数で共有 | **Composable**（`ref` を関数の外に置く） | 数画面で共有したい状態（ログイン状態など） |
| 3. ライブラリ | **Pinia** | 大規模で、状態が複雑に絡み合う場合 |

**多くのアプリは 1 と 2 で足ります。** ShogiProject も Pinia を入れず、2 の Composable で認証状態を共有しています。

### Composable とは（最小の例）

「`ref` を関数の外（モジュールスコープ）に置くと、その状態は import した全員で共有される」——これだけです。

```ts
// src/composables/useCounter.ts
import { ref, readonly } from 'vue'

// 関数の「外」に置くことで、import した全コンポーネントで共有される
const count = ref(0)

export function useCounter() {
  const increment = () => count.value++
  return {
    count: readonly(count), // 外からは読み取り専用にして、変更は increment 経由に限定
    increment,
  }
}
```

これを 2 つの別コンポーネントで `const { count } = useCounter()` すると、**同じ `count` を共有**します。Pinia なしでグローバル状態が作れる、という体験を演習で確かめます。

---

## 演習：Composable で状態を共有する

第 00 章の `learning-vue` で試します。`sample-app/src/composables/useCounter.ts` の内容をコピーして使ってもかまいません。

1. `src/composables/useCounter.ts` を上記の内容で作る
2. 2 つのコンポーネントから `useCounter()` を呼び、片方で `increment()` する
3. **もう片方の表示も増える**ことを確認する（状態が共有されている証拠）

> 完成スニペットは [sample-app/src/composables/useCounter.ts](sample-app/src/composables/useCounter.ts) にあります。

AI への指示はこう出せます:

```
src/composables/useCounter.ts を作って。ref を module スコープに置いて
複数コンポーネントで共有できる Composable にして。外には readonly で公開して。
```

「Pinia を使わず Composable で」と方針を指定しているのがポイントです。

---

## 判断 3：ライブラリとアプリを分ける

機能が「他でも使い回せる UI 部品」なら、アプリ本体から**独立したパッケージ**に切り出す判断があります。

- メリット：アプリのドメイン知識から UI を分離でき、単体でテスト・確認できる
- コスト：パッケージ構成・ビルド設定（型出力など）が増える

ShogiProject では将棋盤を `shogi-board` として切り出しています。**最初から分ける必要はなく**、「明らかに再利用する UI が育ってきたら切り出す」で十分です。判断軸だけ持っておきましょう。

---

## ShogiProject ではどうしているか

- **Composition API + `<script setup>`** を全面採用
- **Pinia 不採用**。認証状態は `shogi-main/src/auth/auth.ts` で `ref` をモジュールスコープに置く Composable パターン（第 05 章で詳述）
- 将棋盤を `shogi-board` ライブラリに分離

`shogi-main/src/auth/auth.ts` を開くと、まさに「`const accessToken = ref(...)` を関数の外に置く」パターンが本物の規模で使われています。

## この章のまとめ

- **Composition API を使う**（AI にも明示する）
- **状態管理は `ref` → Composable → Pinia の順で、必要になるまで上に行かない**
- ライブラリ分割は「育ってから」でよい
- これらは**人間が決めて AI に指示する**判断

次は [02_tooling.md](02_tooling.md) で、各ツールの役割と選定理由を見ます。
