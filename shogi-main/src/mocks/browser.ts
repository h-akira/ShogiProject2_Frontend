import { setupWorker } from 'msw/browser'
import { getUsersMock } from '@/api/generated/main/users/users.msw'
import { getKifusMock } from '@/api/generated/main/kifus/kifus.msw'
import { getSharedMock } from '@/api/generated/main/shared/shared.msw'
import { getTagsMock } from '@/api/generated/main/tags/tags.msw'
import { getAnalysisMock } from '@/api/generated/analysis/analysis/analysis.msw'

export const worker = setupWorker(
  ...getUsersMock(),
  ...getKifusMock(),
  ...getSharedMock(),
  ...getTagsMock(),
  ...getAnalysisMock(),
)
