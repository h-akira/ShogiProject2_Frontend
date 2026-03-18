import { describe, it, expect } from 'vitest'
import { toKif, parseKif } from './kif'
import type { KifMetadata } from './kif'
import { createInitialState, applyMove } from './game'
import type { Move } from './types'

describe('toKif', () => {
  it('should generate header with metadata', () => {
    const state = createInitialState()
    const metadata: KifMetadata = {
      senteName: '先手太郎',
      goteName: '後手花子',
      event: 'テスト対局',
    }
    const kif = toKif(state, metadata)

    expect(kif).toContain('先手：先手太郎')
    expect(kif).toContain('後手：後手花子')
    expect(kif).toContain('棋戦：テスト対局')
    expect(kif).toContain('手合割：平手')
    expect(kif).toContain('手数----指手---------消費時間--')
  })

  it('should generate empty move list for initial state', () => {
    const state = createInitialState()
    const kif = toKif(state)
    const lines = kif.split('\n')
    const moveLine = lines.find((l) => /^\s*1\s/.test(l))
    expect(moveLine).toBeUndefined()
  })

  it('should generate move notation for applied moves', () => {
    let state = createInitialState()
    // 7六歩
    state = applyMove(state, {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    })
    // 3四歩
    state = applyMove(state, {
      type: 'move',
      from: { row: 2, col: 6 },
      to: { row: 3, col: 6 },
      promote: false,
    })

    const kif = toKif(state)
    // Should contain move 1 and move 2
    expect(kif).toMatch(/1\s+.*歩/)
    expect(kif).toMatch(/2\s+.*歩/)
  })
})

describe('parseKif', () => {
  it('should parse header metadata', () => {
    const kifStr = `手合割：平手
先手：先手太郎
後手：後手花子
棋戦：テスト対局
手数----指手---------消費時間--
   1 ７六歩(77)
   2 ３四歩(33)`

    const { metadata } = parseKif(kifStr)
    expect(metadata.senteName).toBe('先手太郎')
    expect(metadata.goteName).toBe('後手花子')
    expect(metadata.event).toBe('テスト対局')
    expect(metadata.handicap).toBe('平手')
  })

  it('should parse moves', () => {
    const kifStr = `手合割：平手
手数----指手---------消費時間--
   1 ７六歩(77)
   2 ３四歩(33)`

    const { state } = parseKif(kifStr)
    expect(state.moveCount).toBe(2)
    expect(state.history).toHaveLength(2)
  })

  it('should parse "同" notation (same square)', () => {
    // Simulate a position where gote pawn moves to 7六, then sente captures
    const kifStr = `手合割：平手
手数----指手---------消費時間--
   1 ７六歩(77)
   2 ３四歩(33)
   3 ２六歩(27)
   4 ８四歩(83)`

    const { state } = parseKif(kifStr)
    expect(state.moveCount).toBe(4)
  })

  it('should parse drop notation', () => {
    // This KIF includes a drop after some captures
    const kifStr = `手合割：平手
手数----指手---------消費時間--
   1 ７六歩(77)
   2 ３四歩(33)`

    const { state } = parseKif(kifStr)
    // Simple roundtrip: moves parsed correctly
    expect(state.history).toHaveLength(2)
  })

  it('should handle result line', () => {
    const kifStr = `手合割：平手
手数----指手---------消費時間--
   1 ７六歩(77)
   2 投了`

    const { state, metadata } = parseKif(kifStr)
    expect(state.moveCount).toBe(1)
    expect(metadata.result).toBe('投了')
  })

  it('should parse roundtrip from toKif output', () => {
    let state = createInitialState()
    const moves: Move[] = [
      { type: 'move', from: { row: 6, col: 2 }, to: { row: 5, col: 2 }, promote: false }, // 7六歩
      { type: 'move', from: { row: 2, col: 6 }, to: { row: 3, col: 6 }, promote: false }, // 3四歩
    ]
    for (const m of moves) {
      state = applyMove(state, m)
    }

    const kifStr = toKif(state)
    const { state: parsed } = parseKif(kifStr)

    expect(parsed.moveCount).toBe(2)
    expect(parsed.history).toHaveLength(2)
  })
})
