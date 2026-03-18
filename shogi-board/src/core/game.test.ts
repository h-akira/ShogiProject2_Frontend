import { describe, it, expect } from 'vitest'
import { createInitialState, applyMove, undoMove, replayToMove } from './game'
import { toSfen } from './sfen'
import type { Move } from './types'

describe('createInitialState', () => {
  it('should create hirate initial state', () => {
    const state = createInitialState()
    expect(state.turn).toBe('sente')
    expect(state.moveCount).toBe(0)
    expect(state.history).toEqual([])

    // Sente king at 5九 (row=8, col=4)
    expect(state.board[8]![4]?.type).toBe('king')
    expect(state.board[8]![4]?.owner).toBe('sente')

    // Gote king at 5一 (row=0, col=4)
    expect(state.board[0]![4]?.type).toBe('king')
    expect(state.board[0]![4]?.owner).toBe('gote')

    // Empty squares in the middle
    expect(state.board[4]![4]).toBeNull()
  })
})

describe('applyMove', () => {
  it('should move a piece on the board', () => {
    const state = createInitialState()
    // 7六歩: from={row:6, col:2} to={row:5, col:2}
    const move: Move = {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    }
    const next = applyMove(state, move)

    expect(next.board[6]![2]).toBeNull()
    expect(next.board[5]![2]).toEqual({ type: 'pawn', owner: 'sente', promoted: false })
    expect(next.turn).toBe('gote')
    expect(next.moveCount).toBe(1)
    expect(next.history).toHaveLength(1)
  })

  it('should not mutate original state', () => {
    const state = createInitialState()
    const sfenBefore = toSfen(state)
    applyMove(state, {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    })
    expect(toSfen(state)).toBe(sfenBefore)
  })

  it('should capture opponent piece and add to hand', () => {
    const state = createInitialState()
    // Setup: place gote pawn at 7六 for sente pawn to capture
    state.board[5]![2] = { type: 'pawn', owner: 'gote', promoted: false }

    const move: Move = {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    }
    const next = applyMove(state, move)

    expect(next.board[5]![2]?.owner).toBe('sente')
    expect(next.hands.sente.pawn).toBe(1)
  })

  it('should promote a piece', () => {
    const state = createInitialState()
    // Place sente pawn at row=3 (gote territory edge)
    state.board[3]![2] = { type: 'pawn', owner: 'sente', promoted: false }
    state.board[6]![2] = null

    const move: Move = {
      type: 'move',
      from: { row: 3, col: 2 },
      to: { row: 2, col: 2 },
      promote: true,
    }
    const next = applyMove(state, move)

    expect(next.board[2]![2]).toEqual({ type: 'pawn', owner: 'sente', promoted: true })
  })

  it('should handle drop move', () => {
    const state = createInitialState()
    state.hands.sente = { pawn: 1 }
    state.board[6]![2] = null // Remove sente pawn from 7七 to allow pawn drop

    const move: Move = {
      type: 'drop',
      pieceType: 'pawn',
      to: { row: 5, col: 2 },
    }
    const next = applyMove(state, move)

    expect(next.board[5]![2]).toEqual({ type: 'pawn', owner: 'sente', promoted: false })
    expect(next.hands.sente.pawn).toBeUndefined()
  })
})

describe('undoMove', () => {
  it('should return null for initial state', () => {
    const state = createInitialState()
    expect(undoMove(state)).toBeNull()
  })

  it('should restore previous state after board move', () => {
    const initial = createInitialState()
    const sfenBefore = toSfen(initial)

    const move: Move = {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    }
    const after = applyMove(initial, move)
    const undone = undoMove(after)

    expect(undone).not.toBeNull()
    expect(toSfen(undone!)).toBe(sfenBefore)
  })

  it('should restore captured piece', () => {
    const state = createInitialState()
    state.board[5]![2] = { type: 'pawn', owner: 'gote', promoted: false }

    const move: Move = {
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    }
    const after = applyMove(state, move)
    const undone = undoMove(after)

    expect(undone).not.toBeNull()
    expect(undone!.board[5]![2]).toEqual({ type: 'pawn', owner: 'gote', promoted: false })
    expect(undone!.hands.sente.pawn).toBeUndefined()
  })

  it('should restore hand after undoing drop', () => {
    const state = createInitialState()
    state.hands.sente = { pawn: 1 }
    state.board[6]![2] = null

    const move: Move = {
      type: 'drop',
      pieceType: 'pawn',
      to: { row: 5, col: 2 },
    }
    const after = applyMove(state, move)
    const undone = undoMove(after)

    expect(undone).not.toBeNull()
    expect(undone!.board[5]![2]).toBeNull()
    expect(undone!.hands.sente.pawn).toBe(1)
  })
})

describe('replayToMove', () => {
  it('should replay moves up to the given index', () => {
    const state = createInitialState()
    const moves: Move[] = [
      { type: 'move', from: { row: 6, col: 2 }, to: { row: 5, col: 2 }, promote: false }, // 7六歩
      { type: 'move', from: { row: 2, col: 2 }, to: { row: 3, col: 2 }, promote: false }, // 3四歩
    ]

    const after0 = replayToMove(state, moves, 0)
    expect(toSfen(after0)).toBe(toSfen(state))

    const after1 = replayToMove(state, moves, 1)
    expect(after1.moveCount).toBe(1)

    const after2 = replayToMove(state, moves, 2)
    expect(after2.moveCount).toBe(2)
  })

  it('should clamp to available moves', () => {
    const state = createInitialState()
    const moves: Move[] = [
      { type: 'move', from: { row: 6, col: 2 }, to: { row: 5, col: 2 }, promote: false },
    ]
    const result = replayToMove(state, moves, 999)
    expect(result.moveCount).toBe(1)
  })
})
