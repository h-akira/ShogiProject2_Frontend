// Kifu types

export type FirstOrSecond = 'none' | 'first' | 'second'
export type KifuResult = 'none' | 'win' | 'lose' | 'sennichite' | 'jishogi'

export interface TagRef {
  tid: string
  name: string
}

export interface KifuSummary {
  kid: string
  slug: string
  first_or_second: FirstOrSecond
  result: KifuResult
  share: boolean
  share_code: string
  created: string
  latest_update: string
  tags: TagRef[]
}

export interface KifuDetail extends KifuSummary {
  kifu: string
  memo: string
}

export interface KifuCreateRequest {
  slug: string
  kifu?: string
  memo?: string
  first_or_second?: FirstOrSecond
  result?: KifuResult
  share?: boolean
  tag_ids?: string[]
}

export interface KifuUpdateRequest extends KifuCreateRequest {}

export interface KifuListResponse {
  items: KifuSummary[]
  next_cursor: string | null
  has_more: boolean
}

// Shared kifu (no private info)
export interface SharedKifu {
  kifu: string
  memo: string
  first_or_second: FirstOrSecond
  result: KifuResult
  share_code: string
  created: string
  latest_update: string
}

// Tag types

export interface Tag {
  tid: string
  name: string
  created: string
  latest_update: string
}

export interface KifuInTag {
  kid: string
  slug: string
  latest_update: string
  created: string
}

export interface TagDetail extends Tag {
  kifus: KifuInTag[]
  kifu_count: number
}

export interface TagCreateRequest {
  name: string
}

export interface TagUpdateRequest {
  name: string
}

// Explorer types

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface ExplorerFolder {
  name: string
  count: number
  path: string
}

export interface ExplorerFile {
  name: string
  kid: string
}

export interface ExplorerResponse {
  current_path: string
  breadcrumbs: BreadcrumbItem[]
  folders: ExplorerFolder[]
  files: ExplorerFile[]
}

// Analysis types

export type AnalysisStatus = 'accepted' | 'running' | 'completed' | 'failed'

export interface AnalysisRequest {
  position: string
  movetime?: number
}

export interface AnalysisCandidate {
  rank: number
  score: number
  pv: string
}

export interface AnalysisResult {
  candidates: AnalysisCandidate[]
}

export interface AnalysisResponse {
  aid: string
  status: AnalysisStatus
  result: AnalysisResult | null
}

// User types

export interface UserProfile {
  username: string
  email: string
  email_verified: boolean
  created_at: string
}

// Error types

export interface ApiErrorDetail {
  code: string
  message: string
  details: Record<string, string>
}

export interface ApiError {
  error: ApiErrorDetail
}
