import { ref, readonly } from 'vue'

// Minimal auth composable for the learning sample.
// Real apps delegate to an IdP (e.g. Cognito) and store tokens; here we just
// fake the logged-in flag with a module-scoped ref so the route guard in
// 05_auth.md has something to check.
const loggedIn = ref(false)

export function useAuth() {
  return {
    isAuthenticated: readonly(loggedIn),
    login: () => (loggedIn.value = true),
    logout: () => (loggedIn.value = false),
  }
}
