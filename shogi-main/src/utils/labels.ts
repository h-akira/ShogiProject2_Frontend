import type { Side, Result } from '@/api/generated/main/model'

export const sideLabel: Record<Side, string> & Record<string, string> = {
  none: '-',
  sente: '先手',
  gote: '後手',
}

export const resultLabel: Record<Result, string> & Record<string, string> = {
  none: '-',
  win: '勝ち',
  loss: '負け',
  sennichite: '千日手',
  jishogi: '持将棋',
}
