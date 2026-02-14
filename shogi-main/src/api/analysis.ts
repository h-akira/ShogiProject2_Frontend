import type { AnalysisRequest, AnalysisResponse } from '@/types/api'
import { mockAnalysisCompleted } from './mock-data'

let callCount = 0

export async function requestAnalysis(
  _req: AnalysisRequest,
): Promise<{ aid: string; status: string }> {
  callCount = 0
  return { aid: 'analysis001', status: 'accepted' }
}

export async function getAnalysisResult(
  _aid: string,
): Promise<AnalysisResponse> {
  // Mock: simulate polling — return "running" first 2 times, then "completed"
  callCount++
  if (callCount <= 2) {
    return { aid: _aid, status: 'running', result: null }
  }
  return { ...mockAnalysisCompleted }
}
