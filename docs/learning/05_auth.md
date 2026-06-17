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

> ベストプラクティス：**認証は自前で作らず IdP に任せる**。パスワード保存などは事故の温床。ShogiProject も Cognito に委譲しています。

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

- **認証は IdP（Cognito）に委譲**し、自前で作らない
- 認証状態は **Composable で共有**（第 01 章の応用）
- 認可は**ルートガード**。ただし**本当の守りはバックエンド**
- 期限切れは**401 → リフレッシュ → リトライ**で扱う
- 開発時は **`DEV` 分岐でモック素通り**
- AI には**フロー名と挙動を具体的に指示**し、生成結果を必ずレビューする

最後は [06_ai_workflow.md](06_ai_workflow.md) で、AI への指示の出し方とベストプラクティスを総まとめします。
