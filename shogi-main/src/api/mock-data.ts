import type {
  KifuDetail,
  Tag,
  TagDetail,
  UserProfile,
  ExplorerResponse,
  SharedKifu,
  AnalysisResponse,
} from '@/types/api'

// Sample KIF for mock data
const sampleKif = `# ---- Kifu for Windows V7 V7.71 棋譜ファイル ----
開始日時：2025/01/20 14:30:00
終了日時：2025/01/20 15:45:00
手合割：平手
先手：hakira
後手：田中太郎
手数----指手---------消費時間--
   1 ７六歩(77)   ( 0:10/0:00:10)
   2 ３四歩(33)   ( 0:05/0:00:05)
   3 ２六歩(27)   ( 0:08/0:00:18)
   4 ８四歩(83)   ( 0:06/0:00:11)
   5 ２五歩(26)   ( 0:04/0:00:22)
   6 ８五歩(84)   ( 0:03/0:00:14)
   7 ７八金(69)   ( 0:12/0:00:34)
   8 ３二金(41)   ( 0:07/0:00:21)
   9 ２四歩(25)   ( 0:15/0:00:49)
  10 同　歩(23)   ( 0:04/0:00:25)
  11 同　飛(28)   ( 0:02/0:00:51)
  12 ２三歩打     ( 0:10/0:00:35)
  13 ２八飛(24)   ( 0:03/0:00:54)
`

export const mockTags: Tag[] = [
  {
    tid: 'tag001',
    name: '居飛車',
    created: '2025-01-10 10:00:00',
    latest_update: '2025-01-10 10:00:00',
  },
  {
    tid: 'tag002',
    name: '角換わり',
    created: '2025-01-12 14:00:00',
    latest_update: '2025-01-12 14:00:00',
  },
  {
    tid: 'tag003',
    name: '四間飛車',
    created: '2025-01-15 09:00:00',
    latest_update: '2025-01-15 09:00:00',
  },
]

export const mockKifus: KifuDetail[] = [
  {
    kid: 'kifu001',
    slug: '2025/01/vs-tanaka.kif',
    kifu: sampleKif,
    memo: '角換わり腰掛け銀の定跡形。途中で相手が変化した。',
    first_or_second: 'first',
    result: 'win',
    share: true,
    share_code: 'abc123def456ghi789jkl012mno345pqr678',
    created: '2025-01-20 14:30:00',
    latest_update: '2025-01-21 09:15:00',
    tags: [
      { tid: 'tag001', name: '居飛車' },
      { tid: 'tag002', name: '角換わり' },
    ],
  },
  {
    kid: 'kifu002',
    slug: '2025/01/vs-suzuki.kif',
    kifu: sampleKif,
    memo: '四間飛車対居飛車急戦。終盤で逆転された。',
    first_or_second: 'second',
    result: 'lose',
    share: false,
    share_code: 'stu901vwx234yza567bcd890efg123hij456',
    created: '2025-01-18 10:00:00',
    latest_update: '2025-01-18 10:00:00',
    tags: [{ tid: 'tag003', name: '四間飛車' }],
  },
  {
    kid: 'kifu003',
    slug: '2025/01/practice/vs-ai-01.kif',
    kifu: sampleKif,
    memo: 'AI対局の練習。',
    first_or_second: 'first',
    result: 'win',
    share: false,
    share_code: 'klm789nop012qrs345tuv678wxy901zab234',
    created: '2025-01-15 20:00:00',
    latest_update: '2025-01-15 20:00:00',
    tags: [],
  },
  {
    kid: 'kifu004',
    slug: '2024/12/tournament/round1.kif',
    kifu: sampleKif,
    memo: '大会1回戦。相居飛車の力戦形。',
    first_or_second: 'first',
    result: 'win',
    share: true,
    share_code: 'cde345fgh678ijk901lmn234opq567rst890',
    created: '2024-12-15 09:00:00',
    latest_update: '2024-12-15 12:00:00',
    tags: [{ tid: 'tag001', name: '居飛車' }],
  },
  {
    kid: 'kifu005',
    slug: '2024/12/tournament/round2.kif',
    kifu: sampleKif,
    memo: '大会2回戦。千日手になった。',
    first_or_second: 'second',
    result: 'sennichite',
    share: false,
    share_code: 'uvw123xyz456abc789def012ghi345jkl678',
    created: '2024-12-15 14:00:00',
    latest_update: '2024-12-15 17:00:00',
    tags: [{ tid: 'tag001', name: '居飛車' }],
  },
]

export const mockTagDetails: TagDetail[] = [
  {
    tid: 'tag001',
    name: '居飛車',
    created: '2025-01-10 10:00:00',
    latest_update: '2025-01-10 10:00:00',
    kifus: [
      { kid: 'kifu001', slug: '2025/01/vs-tanaka.kif', latest_update: '2025-01-21 09:15:00', created: '2025-01-20 14:30:00' },
      { kid: 'kifu004', slug: '2024/12/tournament/round1.kif', latest_update: '2024-12-15 12:00:00', created: '2024-12-15 09:00:00' },
      { kid: 'kifu005', slug: '2024/12/tournament/round2.kif', latest_update: '2024-12-15 17:00:00', created: '2024-12-15 14:00:00' },
    ],
    kifu_count: 3,
  },
  {
    tid: 'tag002',
    name: '角換わり',
    created: '2025-01-12 14:00:00',
    latest_update: '2025-01-12 14:00:00',
    kifus: [
      { kid: 'kifu001', slug: '2025/01/vs-tanaka.kif', latest_update: '2025-01-21 09:15:00', created: '2025-01-20 14:30:00' },
    ],
    kifu_count: 1,
  },
  {
    tid: 'tag003',
    name: '四間飛車',
    created: '2025-01-15 09:00:00',
    latest_update: '2025-01-15 09:00:00',
    kifus: [
      { kid: 'kifu002', slug: '2025/01/vs-suzuki.kif', latest_update: '2025-01-18 10:00:00', created: '2025-01-18 10:00:00' },
    ],
    kifu_count: 1,
  },
]

export const mockUser: UserProfile = {
  username: 'hakira',
  email: 'hakira@example.com',
  email_verified: true,
  created_at: '2025-01-15T10:00:00+09:00',
}

export const mockExplorerRoot: ExplorerResponse = {
  current_path: '',
  breadcrumbs: [],
  folders: [
    { name: '2025', count: 3, path: 'MjAyNQ' },
    { name: '2024', count: 2, path: 'MjAyNA' },
  ],
  files: [],
}

export const mockExplorer2025: ExplorerResponse = {
  current_path: '2025',
  breadcrumbs: [{ name: '2025', path: 'MjAyNQ' }],
  folders: [
    { name: '01', count: 3, path: 'MjAyNS8wMQ' },
  ],
  files: [],
}

export const mockExplorer202501: ExplorerResponse = {
  current_path: '2025/01',
  breadcrumbs: [
    { name: '2025', path: 'MjAyNQ' },
    { name: '01', path: 'MjAyNS8wMQ' },
  ],
  folders: [
    { name: 'practice', count: 1, path: 'MjAyNS8wMS9wcmFjdGljZQ' },
  ],
  files: [
    { name: 'vs-tanaka.kif', kid: 'kifu001' },
    { name: 'vs-suzuki.kif', kid: 'kifu002' },
  ],
}

export const mockSharedKifu: SharedKifu = {
  kifu: sampleKif,
  memo: '角換わり腰掛け銀の定跡形',
  first_or_second: 'first',
  result: 'win',
  share_code: 'abc123def456ghi789jkl012mno345pqr678',
  created: '2025-01-20 14:30:00',
  latest_update: '2025-01-21 09:15:00',
}

export const mockAnalysisCompleted: AnalysisResponse = {
  aid: 'analysis001',
  status: 'completed',
  result: {
    candidates: [
      { rank: 1, score: 120, pv: '▲７六歩(77) △８四歩(83) ▲２六歩(27)' },
      { rank: 2, score: 95, pv: '▲２六歩(27) △８四歩(83) ▲７六歩(77)' },
      { rank: 3, score: 80, pv: '▲５六歩(57) △３四歩(33) ▲７六歩(77)' },
    ],
  },
}
