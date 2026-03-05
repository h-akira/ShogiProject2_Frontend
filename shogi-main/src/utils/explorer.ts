export function buildBreadcrumbs(
  path: string,
): { name: string; path: string }[] {
  if (!path) return []
  const parts = path.split('/')
  return parts.map((name, i) => ({
    name,
    path: parts.slice(0, i + 1).join('/'),
  }))
}
