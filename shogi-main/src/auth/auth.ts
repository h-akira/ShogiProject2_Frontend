import { ref, readonly, computed } from 'vue'

const IS_DEV = import.meta.env.DEV

// Cognito Managed Login 設定（本番のみ使用）
const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI
const SCOPES = 'openid email profile'

// トークン保存キー
const ACCESS_TOKEN_KEY = 'cognito_access_token'
const ID_TOKEN_KEY = 'cognito_id_token'
const REFRESH_TOKEN_KEY = 'cognito_refresh_token'
const PKCE_VERIFIER_KEY = 'cognito_pkce_verifier'

// リアクティブ状態
const accessToken = ref<string | null>(sessionStorage.getItem(ACCESS_TOKEN_KEY))
const idToken = ref<string | null>(sessionStorage.getItem(ID_TOKEN_KEY))

const isAuthenticated = computed(() => {
  if (IS_DEV) return accessToken.value === 'mock_access_token'
  return !!accessToken.value
})

const user = computed(() => {
  if (IS_DEV) {
    if (!isAuthenticated.value) return null
    return { username: 'dev-user-id', email: 'dev@example.com' }
  }
  if (!idToken.value) return null
  try {
    const parts = idToken.value.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1]!))
    return {
      username: payload.sub ?? payload['cognito:username'] ?? '',
      email: payload.email ?? '',
    }
  } catch {
    return null
  }
})

function saveTokens(tokens: { access_token: string; id_token: string; refresh_token?: string }) {
  accessToken.value = tokens.access_token
  idToken.value = tokens.id_token
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  sessionStorage.setItem(ID_TOKEN_KEY, tokens.id_token)
  if (tokens.refresh_token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  }
}

function clearTokens() {
  accessToken.value = null
  idToken.value = null
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ID_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

// --- PKCE ユーティリティ ---

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generatePkce(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64)
  const hashed = await sha256(verifier)
  const challenge = base64UrlEncode(hashed)
  return { verifier, challenge }
}

// --- 公開 API ---

export function useAuth() {
  async function login() {
    if (IS_DEV) {
      // DEV: モック認証（即座にログイン状態にする）
      saveTokens({ access_token: 'mock_access_token', id_token: 'mock_id_token' })
      return
    }
    // PROD: Cognito Managed Login にリダイレクト
    const { verifier, challenge } = await generatePkce()
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })
    window.location.href = `https://${COGNITO_DOMAIN}/oauth2/authorize?${params}`
  }

  function logout() {
    clearTokens()
    if (IS_DEV) return
    // PROD: Cognito /logout にリダイレクト
    const logoutUri = REDIRECT_URI.replace('/callback', '/')
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      logout_uri: logoutUri,
    })
    window.location.href = `https://${COGNITO_DOMAIN}/logout?${params}`
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    login,
    logout,
  }
}

/**
 * コールバックで受け取った authorization code を PKCE verifier と共にトークンに交換する
 */
export async function exchangeCodeForTokens(code: string): Promise<boolean> {
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  if (!codeVerifier) return false

  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }),
    })
    if (!res.ok) return false

    const tokens = await res.json()
    saveTokens(tokens)
    sessionStorage.removeItem(PKCE_VERIFIER_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * API 呼び出し用のアクセストークンを取得する
 */
export function getAccessToken(): string {
  return accessToken.value ?? ''
}

/**
 * API Gateway Cognito Authorizer 用の ID トークンを取得する
 */
export function getIdToken(): string {
  return idToken.value ?? ''
}
