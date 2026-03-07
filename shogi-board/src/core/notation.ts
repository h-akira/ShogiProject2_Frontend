import type { GameState } from './types'
import { PIECE_DISPLAY } from './constants'
import { parseSfen, parseUsiMove } from './sfen'
import { applyMove } from './game'

const ZENKAKU_DIGITS = ['１', '２', '３', '４', '５', '６', '７', '８', '９']
const KANSUJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

function posToJapanese(col: number, row: number): string {
  return ZENKAKU_DIGITS[8 - col]! + KANSUJI[row]!
}

/**
 * USI 形式の読み筋を日本語棋譜表記に変換する。
 * @param sfen - 開始局面（SFEN 形式）
 * @param usiMoves - USI 形式の手順（スペース区切り文字列）
 * @returns 日本語棋譜表記の配列（例: ["▲２六歩", "△４四歩"]）
 */
export function usiMovesToJapanese(sfen: string, usiMoves: string): string[] {
  const moves = usiMoves.trim().split(/\s+/)
  if (moves.length === 0 || moves[0] === '') return []

  let state: GameState = parseSfen(sfen)
  const result: string[] = []
  let prevTo: { row: number; col: number } | null = null

  for (const usi of moves) {
    const move = parseUsiMove(usi)
    const turnMark = state.turn === 'sente' ? '▲' : '△'

    let pieceName: string
    let isDrop = false

    if (move.type === 'drop') {
      const disp = PIECE_DISPLAY[move.pieceType]
      pieceName = disp.normal
      isDrop = true
    } else {
      const piece = state.board[move.from.row]![move.from.col]!
      const disp = PIECE_DISPLAY[piece.type]
      pieceName = piece.promoted ? disp.promoted : disp.normal
    }

    const to = move.to
    const isSame = prevTo !== null && prevTo.row === to.row && prevTo.col === to.col
    const destStr = isSame ? '同' : posToJapanese(to.col, to.row)

    let suffix = ''
    if (move.type === 'move' && move.promote) suffix = '成'
    if (isDrop) suffix = '打'

    result.push(turnMark + destStr + pieceName + suffix)

    state = applyMove(state, move)
    prevTo = { row: to.row, col: to.col }
  }

  return result
}
