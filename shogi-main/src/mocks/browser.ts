import { setupWorker } from 'msw/browser'
import { getUsersMock } from '@/api/generated/main/users/users.msw'
import { getKifusMock, getGetKifuMockHandler, getCreateKifuMockHandler, getUpdateKifuMockHandler } from '@/api/generated/main/kifus/kifus.msw'
import { getSharedMock, getGetSharedKifuMockHandler } from '@/api/generated/main/shared/shared.msw'
import { getTagsMock } from '@/api/generated/main/tags/tags.msw'
import { getAnalysisMock } from '@/api/generated/analysis/analysis/analysis.msw'
import sampleKif from './sample.kif?raw'

export const worker = setupWorker(
  ...getUsersMock(),
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
  ...getAnalysisMock(),
)
