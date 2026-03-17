import { setupWorker } from 'msw/browser'
import { getUsersMock } from '@/api/generated/main/users/users.msw'
import { getGetRecentKifusMockHandler, getGetKifuExplorerMockHandler, getGetKifuMockHandler, getCreateKifuMockHandler, getUpdateKifuMockHandler } from '@/api/generated/main/kifus/kifus.msw'
import { getGetSharedKifuMockHandler } from '@/api/generated/main/shared/shared.msw'
import { getTagsMock } from '@/api/generated/main/tags/tags.msw'
import { getCreateAnalysisMockHandler, getGetAnalysisMockHandler } from '@/api/generated/analysis/analysis/analysis.msw'
import sampleKif from './sample.kif?raw'

export const worker = setupWorker(
  ...getUsersMock(),
  getGetRecentKifusMockHandler({
    kifus: [
      {
        kid: 'test-kid-001',
        slug: '20240101_vs_tanaka',
        side: 'sente',
        result: 'win',
        tags: [{ tid: 'tag-001', name: '居飛車' }],
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        kid: 'test-kid-002',
        slug: '20240108_vs_suzuki',
        side: 'gote',
        result: 'loss',
        tags: [{ tid: 'tag-002', name: '振り飛車' }],
        updated_at: '2024-01-08T14:00:00Z',
      },
      {
        kid: 'test-kid-003',
        slug: '20231225_vs_sato',
        side: 'sente',
        result: 'win',
        tags: [{ tid: 'tag-001', name: '居飛車' }, { tid: 'tag-003', name: '角換わり' }],
        updated_at: '2023-12-25T09:00:00Z',
      },
      {
        kid: 'test-kid-004',
        slug: '20231220_vs_yamada',
        side: 'gote',
        result: 'win',
        tags: [{ tid: 'tag-002', name: '振り飛車' }],
        updated_at: '2023-12-20T18:45:00Z',
      },
      {
        kid: 'test-kid-005',
        slug: '20231210_vs_ito',
        side: 'sente',
        result: 'loss',
        tags: [{ tid: 'tag-001', name: '居飛車' }],
        updated_at: '2023-12-10T20:00:00Z',
      },
    ],
    total_count: 5,
  }),
  getGetKifuExplorerMockHandler({
    path: '',
    folders: [
      { name: '居飛車', count: 3 },
      { name: '振り飛車', count: 2 },
    ],
    files: [
      { kid: 'test-kid-001', name: '20240101_vs_tanaka' },
      { kid: 'test-kid-002', name: '20240108_vs_suzuki' },
      { kid: 'test-kid-003', name: '20231225_vs_sato' },
      { kid: 'test-kid-004', name: '20231220_vs_yamada' },
      { kid: 'test-kid-005', name: '20231210_vs_ito' },
    ],
  }),
  getGetKifuMockHandler((info) => ({
    kid: 'test-kid-001',
    slug: 'test-slug',
    side: 'sente',
    result: 'win',
    tags: [{ tid: 'tag-001', name: 'テストタグ' }],
    memo: 'テスト棋譜',
    shared: false,
    share_code: undefined,
    kif: sampleKif,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })),
  getCreateKifuMockHandler((info) => ({
    kid: 'test-kid-002',
    slug: 'test-slug-2',
    side: 'sente',
    result: 'win',
    tags: [],
    memo: '',
    shared: false,
    share_code: undefined,
    kif: sampleKif,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })),
  getUpdateKifuMockHandler((info) => ({
    kid: 'test-kid-001',
    slug: 'test-slug',
    side: 'sente',
    result: 'win',
    tags: [],
    memo: '',
    shared: false,
    share_code: undefined,
    kif: sampleKif,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })),
  getGetSharedKifuMockHandler((info) => ({
    kid: 'shared-kid-001',
    slug: 'shared-slug',
    side: 'sente',
    result: 'win',
    tags: [{ tid: 'tag-001', name: 'テストタグ' }],
    memo: '共有テスト棋譜',
    kif: sampleKif,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })),
  ...getTagsMock(),
  getCreateAnalysisMockHandler({
    aid: 'mock-aid-001',
    status: 'pending',
  }),
  getGetAnalysisMockHandler((info) => ({
    aid: 'mock-aid-001',
    status: 'completed',
    sfen: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1',
    thinking_time: 3000,
    candidates: [
      { rank: 1, score: 120, pv: '2g2f 8c8d 7g7f' },
      { rank: 2, score: 80, pv: '7g7f 3c3d 2g2f' },
      { rank: 3, score: 60, pv: '2g2f 3c3d 7g7f' },
    ],
    created_at: '2024-01-01T00:00:00Z',
  })),
)
