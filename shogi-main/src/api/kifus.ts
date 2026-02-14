import type {
  KifuListResponse,
  KifuDetail,
  KifuCreateRequest,
  KifuUpdateRequest,
  ExplorerResponse,
  SharedKifu,
} from '@/types/api'
import {
  mockKifus,
  mockExplorerRoot,
  mockExplorer2025,
  mockExplorer202501,
  mockSharedKifu,
} from './mock-data'

let kifuStore = [...mockKifus]

export async function getKifus(
  _limit?: number,
  _cursor?: string,
): Promise<KifuListResponse> {
  // Mock: return all kifus sorted by latest_update desc
  const sorted = [...kifuStore].sort(
    (a, b) => b.latest_update.localeCompare(a.latest_update),
  )
  return {
    items: sorted.map(({ kifu: _kifu, memo: _memo, ...summary }) => summary),
    next_cursor: null,
    has_more: false,
  }
}

export async function getKifu(kid: string): Promise<KifuDetail> {
  const kifu = kifuStore.find((k) => k.kid === kid)
  if (!kifu) throw new Error(`Kifu not found: ${kid}`)
  return { ...kifu }
}

export async function createKifu(req: KifuCreateRequest): Promise<KifuDetail> {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const kid = `kifu${String(kifuStore.length + 1).padStart(3, '0')}`
  const newKifu: KifuDetail = {
    kid,
    slug: req.slug.endsWith('.kif') ? req.slug : `${req.slug}.kif`,
    kifu: req.kifu ?? '',
    memo: req.memo ?? '',
    first_or_second: req.first_or_second ?? 'none',
    result: req.result ?? 'none',
    share: req.share ?? false,
    share_code: Math.random().toString(36).slice(2).repeat(3).slice(0, 36),
    created: now,
    latest_update: now,
    tags: [],
  }
  kifuStore.push(newKifu)
  return { ...newKifu }
}

export async function updateKifu(
  kid: string,
  req: KifuUpdateRequest,
): Promise<KifuDetail> {
  const idx = kifuStore.findIndex((k) => k.kid === kid)
  if (idx === -1) throw new Error(`Kifu not found: ${kid}`)
  const existing = kifuStore[idx]!
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const updated: KifuDetail = {
    ...existing,
    slug: req.slug.endsWith('.kif') ? req.slug : `${req.slug}.kif`,
    kifu: req.kifu ?? existing.kifu,
    memo: req.memo ?? existing.memo,
    first_or_second: req.first_or_second ?? existing.first_or_second,
    result: req.result ?? existing.result,
    share: req.share ?? existing.share,
    latest_update: now,
  }
  kifuStore[idx] = updated
  return { ...updated }
}

export async function deleteKifu(kid: string): Promise<void> {
  kifuStore = kifuStore.filter((k) => k.kid !== kid)
}

export async function getExplorer(path?: string): Promise<ExplorerResponse> {
  // Mock: return predefined responses based on path
  if (!path) return { ...mockExplorerRoot }
  const decoded = atob(path)
  if (decoded === '2025') return { ...mockExplorer2025 }
  if (decoded === '2025/01') return { ...mockExplorer202501 }
  return {
    current_path: decoded,
    breadcrumbs: [],
    folders: [],
    files: [],
  }
}

export async function getSharedKifu(_shareCode: string): Promise<SharedKifu> {
  return { ...mockSharedKifu }
}
