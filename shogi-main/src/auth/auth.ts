import { ref, readonly } from 'vue'

// Mock auth state — will be replaced with oidc-client-ts UserManager
const isAuthenticated = ref(true)
const user = ref<{ username: string; email: string } | null>({
  username: 'hakira',
  email: 'hakira@example.com',
})

export function useAuth() {
  function login() {
    // Will be: userManager.signinRedirect()
    isAuthenticated.value = true
    user.value = { username: 'hakira', email: 'hakira@example.com' }
  }

  function logout() {
    // Will be: userManager.signoutRedirect()
    isAuthenticated.value = false
    user.value = null
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    login,
    logout,
  }
}
