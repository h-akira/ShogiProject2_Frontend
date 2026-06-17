import { ref, readonly } from 'vue'

// Place the ref OUTSIDE the function (module scope) so the state is shared
// across every component that imports this composable. This is the
// "Pinia なし" pattern: module-scoped ref = shared global state.
const count = ref(0)

export function useCounter() {
  const increment = () => count.value++
  const reset = () => (count.value = 0)

  return {
    // Expose as readonly so callers cannot mutate directly;
    // mutations must go through increment/reset.
    count: readonly(count),
    increment,
    reset,
  }
}
