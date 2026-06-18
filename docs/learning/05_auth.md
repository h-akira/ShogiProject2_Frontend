# 05. 認証・認可のパターン

## ゴール

AI 駆動開発で**特につまずきやすい**認証・認可を、パターンとして理解する。ShogiProject の実装を題材に「なぜこうするか」を押さえ、最小のルートガードを自分で書いて体験します。

> なぜ AI がつまずくか：認証はトークンの保存場所・更新・リダイレクト・ガードなど**多数の判断が絡む**うえ、セキュリティに直結します。AI に丸投げすると、危険な実装（トークンを平文で残す、リフレッシュを忘れる等）になりがちです。**人間がパターンを知って指示・レビューする**必要があります。

---

## 認証の登場人物（フロント視点）

| 用語 | 意味 |
|------|------|
| **認証（Authentication）** | 「誰か」を確かめる（ログイン） |
| **認可（Authorization）** | 「何をしてよいか」を制御（このページを見てよいか等） |
| **トークン** | ログイン後に発行される「会員証」。API 呼び出し時に提示する |
| **IdP（認証基盤）** | 認証を肩代わりするサービス。ShogiProject は **Amazon Cognito** |

> ベストプラクティス：**本人確認そのもの（パスワード保存・検証）は自前で作らず IdP に任せる**。ここは事故の温床なので委譲する。一方で、IdP と**つなぐ部分**（ログインへの誘導・トークンの取得/保存）をライブラリに任せるか手書きするかは別の選定（後述）。ShogiProject も認証の本体は Cognito に委譲しつつ、つなぎは手書きしています。

---

## ShogiProject の認証フロー（OAuth2 + PKCE）

```
1. ユーザーが「ログイン」押下
2. Cognito のログイン画面にリダイレクト（PKCE challenge 付き）
3. ユーザーが認証
4. /callback に authorization code が返る
5. フロントが code を Cognito に送り、トークンを取得
6. トークンを保存（sessionStorage + Vue の ref）
```

これは **Authorization Code + PKCE** という、SPA で標準的かつ安全なフローです。AI に認証を頼むときは「**Cognito の Authorization Code + PKCE フローで**」と明示すると、危険な簡易実装を避けられます。

### PKCE とは（なぜ要るのか）

**PKCE**（ピクシー / Proof Key for Code Exchange）は、**「authorization code を横取りされても悪用されないようにする」仕組み**です。SPA やモバイルのような、秘密鍵を安全に隠せないアプリのために用意されました。

何が問題かというと、フローの手順 4 で **authorization code**（トークンと交換できる引換券）がブラウザの URL（リダイレクト）に乗って返ってきます。**この引換券が途中で漏れる**と、攻撃者がそれをトークンに交換できてしまう恐れがあります。PKCE はこれを「引換券だけでは交換できない」ようにします。

仕組みはシンプルで、**ログインのたびに使い捨ての合言葉を作る**だけです。

1. ログイン開始時、ランダムな秘密の文字列 **verifier**（合言葉の本体）を作る
2. その verifier を SHA-256 でハッシュ化した **challenge**（合言葉のハッシュ）を作る
3. **challenge** をログインのリダイレクトに付けて送る（手順 2）。verifier は自分の手元（`sessionStorage`）に隠しておく
4. 引換券をトークンに交換するとき（手順 5）、隠していた **verifier 本体**を一緒に送る
5. Cognito 側で「送られた verifier をハッシュ化したら、最初の challenge と一致するか」を検証。一致して初めてトークンを発行する

> ポイント：引換券（code）を横取りしても、**verifier 本体を知らなければトークンに交換できません**。verifier はネットワークに流れず手元に隠れているからです。「先にハッシュ（challenge）だけ預け、後で本体（verifier）を見せて本人性を証明する」——これが PKCE の核心です。
>
> ShogiProject では `auth.ts` の `generatePkce()` が `crypto.subtle.digest('SHA-256', ...)` でこれを**自前実装**しています（Amplify を使えばライブラリが裏でやってくれる部分）。`code_challenge_method: 'S256'` が「SHA-256 を使う」という宣言です。

> AI への注意：「PKCE で」と指定しないと、AI が PKCE 無しの古い Implicit フローや、verifier をうっかり一緒に保存・送信する**不完全な実装**を出すことがあります。フロー名を明示し、生成結果はレビューしましょう。

---

## 選定：Cognito は固定でも「ログイン UI」と「つなぐライブラリ」は選べる

AWS を使う以上、認証基盤（IdP）が **Cognito** であることは事実上固定です。しかし**その上にどうログイン体験を載せ、どのライブラリでつなぐか**には選択肢があり、ここは**ライブラリ選定の判断**になります。AI に丸投げすると構成がぶれやすいので、人間が方針を持つ必要があります。

判断は**独立した 2 つの層**に分かれます。混同しやすいので分けて考えます。

### 層1：ログイン画面をどう出すか

| 選択肢 | 何をする | 向いている場面 |
|--------|----------|----------------|
| **Managed Login（ホスト型 UI）** | Cognito が用意したログイン画面に**リダイレクト**する。画面は AWS 側 | ログイン UI を自作したくない。標準で十分 |
| **自前ログイン画面** | 自分でフォームを作り、認証 API を直接呼ぶ | デザインを完全に作り込みたい。要件が特殊 |

> Managed Login は「固定」ではありません。ロゴ・配色などの**カスタマイズが可能**で、見た目をある程度ブランドに寄せられます。一方、**画面そのものを自分の SPA 内に持ちたい**なら自前画面が必要になります。ShogiProject は **Managed Login**（リダイレクト方式）を採用しています。

### 層2：どのライブラリでつなぐか（SDK 選定）

ログイン後の「PKCE 生成・トークン取得・更新・保存」を**何に任せるか**の選択です。**抽象度の高い順**に 3 つ。

| 選択肢 | 抽象度 | 中身 | トレードオフ |
|--------|--------|------|--------------|
| **AWS Amplify (Auth)** | 高 | `signInWithRedirect()` 等を呼ぶだけで PKCE・トークン管理まで**ライブラリ任せ** | 楽。ただし**バンドルが大きく**、Amplify 流儀に乗る前提。細かい制御はしにくい |
| **OIDC 汎用ライブラリ**（例: `oidc-client-ts`） | 中 | OAuth2/OIDC の標準クライアント。Cognito 専用ではない | 標準準拠で移植性が高い。Cognito 固有機能は別途 |
| **低レベル SDK + 手書き** | 低 | `@aws-sdk/client-cognito-identity-provider` や素の `fetch` で自分で組む | 依存が最小・挙動を完全制御。**自分で PKCE 等を書く**手間と責任 |

> 両論併記（Amplify を使う / 使わない）：
> - **Amplify が向くケース** … 認証以外でも Amplify（ストレージ・API 等）を使う、ログイン処理を早く済ませたい、自前で OAuth を書く自信がない。
> - **Amplify を避けるケース** … 依存とバンドルサイズを絞りたい、フローを細かく制御したい、Amplify の流儀に縛られたくない。
>
> どちらが正解ということはなく、**プロジェクトの規模と「他に Amplify を使うか」で決まります**。

### ShogiProject の実際の選定

ShogiProject は **「Managed Login + 低レベル SDK / 手書き」** を選んでいます（`shogi-main/src/auth/auth.ts` で確認できます）。

- **Amplify は使っていない**。依存に入っているのは `@aws-sdk/client-cognito-identity-provider` のみで、これは Amplify ではなく**パスワード変更など個別 API 操作のための低レベル SDK**
- PKCE の生成（`crypto.subtle` で SHA-256）を**自前実装**
- Cognito の OAuth2 エンドポイント（`/oauth2/authorize`・`/oauth2/token`・`/logout`）を**素の `fetch`／リダイレクトで直接呼ぶ**

つまり「ライブラリに任せず、薄く手書きする」方針です。**依存を最小化し挙動を完全に制御できる**反面、PKCE やトークン更新（後述）を**自分で正しく書く必要がある**——その手書き部分を以降のパターンで見ていきます。

#### 補足：SDK は「ログイン」には使わない（役割の棲み分け）

混乱しやすいので明確にします。上の `@aws-sdk/...` SDK は **ログインには一切使いません**。役割が分かれています。

| やること | 手段 | 実装場所 |
|----------|------|----------|
| **ログイン / ログアウト** | Managed Login への**リダイレクト** + OAuth2 を手書き `fetch` | `auth.ts` |
| **パスワード変更** | SDK の `ChangePasswordCommand` を `client.send()` | `ChangePasswordPage.vue` |

なぜ分かれるのか:

- **ログイン**は「ユーザーをブラウザごと Cognito のログイン画面に飛ばす」リダイレクト方式。だから SDK ではなく `window.location.href = .../oauth2/authorize` という**画面遷移**で行う。SDK の出番は無い。
- **パスワード変更**は「**すでにログイン済み**のユーザーが、画面遷移せずアプリ内で自分のパスワードを変える」操作。**Managed Login の画面はログインの入り口専用で、ログイン後のこうした管理操作はカバーしません**。そこでアプリ内から Cognito の API を 1 本叩く SDK（`ChangePasswordCommand`）を使う。

> まとめると：**Managed Login（リダイレクト）＝ ログインの入り口専用。SDK ＝ ログイン後の個別操作（パスワード変更・退会など）専用。** 両者は重複せず補完関係です。「低レベル SDK」とは、こうした操作を **1 操作 = 1 つの Command クラス**で素朴に呼ぶ薄い公式 SDK のこと（Amplify のような高機能ラッパーではない）を指します。

> AI への指示のコツ：認証を頼むときは**この 2 層を明示**します。例：「Cognito の Managed Login にリダイレクトする方式で。Amplify は使わず、PKCE と /oauth2/token 呼び出しは手書きで」。層を指定しないと、AI が勝手に Amplify を入れたり自前ログイン画面を作ったりして、意図とずれます。

---

## パターン 1：トークンの保持は「Composable」で

第 01 章の Composable パターンが、認証状態の共有にそのまま使われています。`ref` をモジュールスコープに置き、全画面で共有します。

```ts
// ShogiProject の shogi-main/src/auth/auth.ts（抜粋・本物）
import { ref, readonly, computed } from 'vue'

// module スコープ = アプリ全体で共有される認証状態
const accessToken = ref<string | null>(sessionStorage.getItem('cognito_access_token'))

const isAuthenticated = computed(() => !!accessToken.value)

export function useAuth() {
  return { isAuthenticated: readonly(isAuthenticated) /* ... */ }
}
```

ポイント:
- **Pinia を使わず**、Composable だけで認証状態を共有（第 01 章の判断がここに効く）
- トークンの**実体は `sessionStorage`**、リアクティブな表示用に **`ref`** にも持つ、の二重持ち
- `sessionStorage` を選ぶ理由：タブを閉じれば消える＝**`localStorage` より漏洩リスクが低い**（トレードオフは ShogiProject の `docs/auth_architecture.md` に整理あり）

---

## パターン 2：認可は「ルートガード」で

「ログインしていない人を特定ページに入れない」のが認可の基本。Vue Router の**ガード**で実現します。

ShogiProject の実装（`shogi-main/src/router/index.ts`）:

```ts
// 各ルートに「認証が要る」という印を付ける
{ path: '/kifus', component: KifuListPage, meta: { requiresAuth: true } }

// 全遷移の前に検査する
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      return { name: 'home' }   // 未ログインならホームへ追い返す
    }
  }
})
```

> 重要な前提：**フロントのガードは「UX のための関所」であって、セキュリティの本丸ではない**。本当の守りは**バックエンド側**（ShogiProject では API Gateway の Cognito Authorizer が JWT を検証）。フロントのガードを突破されても、API がトークンを検証して弾きます。**「フロントのガード＝親切な案内、バックの検証＝本当の鍵」**と理解してください。

---

## パターン 3：401 が来たらトークンを更新（リフレッシュ）

トークンには有効期限があります（ShogiProject では 1 時間）。期限切れで API が **401** を返したら、リフレッシュトークンで新しいトークンを取り直して**自動リトライ**します。ShogiProject は `custom-fetch.ts` でこれを共通化しています（同時多発の 401 は Promise 共有で 1 回にまとめる）。

> AI への指示のコツ：「401 を受けたらリフレッシュして 1 回だけリトライ、失敗ならログアウト」と**挙動を具体的に**指示する。曖昧だと無限リトライなどの危険な実装になりがちです。

---

## パターン 4：開発時は認証をモックで素通り

毎回ログインするのは面倒なので、**開発時だけ認証を迂回**します。第 04 章の `DEV` 分岐と同じ考え方です。

```ts
// auth.ts（抜粋）
const isAuthenticated = computed(() => {
  if (IS_DEV) return accessToken.value === 'mock_access_token'  // 開発: モック判定
  return !!accessToken.value                                    // 本番: 実トークン
})
```

開発時は `mock_access_token` を入れておけば「ログイン済み」とみなされ、Cognito を経由せず画面を確認できます。本番ビルドでは実トークン判定になります。

---

## 演習：最小のルートガードを書く

第 00 章の `learning-vue`（Router あり）で、**ログイン状態に応じてページを守る**最小実装を作ります。本物の Cognito は使わず、ログイン状態を `ref` で偽装します。

1. `src/auth/useAuth.ts` を作る（最小版）:

```ts
import { ref, readonly } from 'vue'
const loggedIn = ref(false)
export function useAuth() {
  return {
    isAuthenticated: readonly(loggedIn),
    login: () => (loggedIn.value = true),
    logout: () => (loggedIn.value = false),
  }
}
```

2. ルーターにガードを足す（`src/router/index.ts`）:

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuth().isAuthenticated.value) {
    return { name: 'home' }   // 未ログインなら追い返す
  }
})
```

3. どれかのルートに `meta: { requiresAuth: true }` を付ける
4. ログアウト状態でそのページに行こうとすると**ホームに戻される**こと、`login()` 後は**入れる**ことを確認する

> 完成スニペットは [sample-app/src/composables/useAuth.ts](sample-app/src/composables/useAuth.ts) を参照。これで「認可＝遷移前にガードで判定」の骨格が体に入ります。

---

## ShogiProject ではどうしているか

- `shogi-main/src/auth/auth.ts` … Composable で認証状態を共有、Cognito + PKCE、リフレッシュ
- `shogi-main/src/router/index.ts` … `meta.requiresAuth` + `beforeEach` ガード
- `shogi-main/src/api/custom-fetch.ts` … 401 → リフレッシュ → リトライを共通化
- `Frontend/docs/auth_architecture.md` … 設計判断（sessionStorage 選定理由など）の記録

## この章のまとめ

- **認証は IdP（Cognito）に委譲**し、本人確認やパスワード管理を自前で持たない
- **Cognito は固定でも、ログイン UI（Managed Login / 自前）と、つなぐライブラリ（Amplify / OIDC 汎用 / 手書き）は選定する**
- 認証状態は **Composable で共有**（第 01 章の応用）
- 認可は**ルートガード**。ただし**本当の守りはバックエンド**
- 期限切れは**401 → リフレッシュ → リトライ**で扱う
- 開発時は **`DEV` 分岐でモック素通り**
- AI には**フロー名と挙動を具体的に指示**し、生成結果を必ずレビューする

最後は [06_ai_workflow.md](06_ai_workflow.md) で、AI への指示の出し方とベストプラクティスを総まとめします。
