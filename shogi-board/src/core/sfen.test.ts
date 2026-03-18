import { describe, it, expect } from 'vitest'
import { toSfen, parseSfen, moveToUsi, parseUsiMove } from './sfen'
import { createInitialState } from './game'

describe('toSfen', () => {
  it('should return hirate SFEN for initial state', () => {
    const state = createInitialState()
    expect(toSfen(state)).toBe('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1')
  })

  it('should represent gote turn with w', () => {
    const state = { ...createInitialState(), turn: 'gote' as const }
    const sfen = toSfen(state)
    expect(sfen).toContain(' w ')
  })

  it('should encode hand pieces', () => {
    const state = createInitialState()
    state.hands.sente = { pawn: 2, gold: 1 }
    const sfen = toSfen(state)
    // Hand section: G2P (gold=1 → G, pawn=2 → 2P, sente pieces uppercase)
    expect(sfen.split(' ')[2]).toBe('G2P')
  })

  it('should encode both player hand pieces', () => {
    const state = createInitialState()
    state.hands.sente = { rook: 1 }
    state.hands.gote = { pawn: 3 }
    const sfen = toSfen(state)
    expect(sfen.split(' ')[2]).toBe('R3p')
  })

  it('should encode move count', () => {
    const state = { ...createInitialState(), moveCount: 10 }
    const sfen = toSfen(state)
    expect(sfen.split(' ')[3]).toBe('11')
  })
})

describe('parseSfen', () => {
  it('should parse hirate SFEN', () => {
    const sfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
    const state = parseSfen(sfen)

    expect(state.turn).toBe('sente')
    expect(state.moveCount).toBe(0)

    // Verify sente king at 5九 (row=8, col=4)
    expect(state.board[8]![4]).toEqual({ type: 'king', owner: 'sente', promoted: false })
    // Verify gote king at 5一 (row=0, col=4)
    expect(state.board[0]![4]).toEqual({ type: 'king', owner: 'gote', promoted: false })
  })

  it('should parse gote turn', () => {
    const sfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1'
    const state = parseSfen(sfen)
    expect(state.turn).toBe('gote')
  })

  it('should parse hand pieces', () => {
    const sfen = '9/9/9/9/4k4/9/9/9/4K4 b G2Pn 1'
    const state = parseSfen(sfen)
    expect(state.hands.sente.gold).toBe(1)
    expect(state.hands.sente.pawn).toBe(2)
    expect(state.hands.gote.knight).toBe(1)
  })

  it('should parse promoted pieces', () => {
    const sfen = '9/9/9/9/4k4/9/9/+R8/4K4 b - 1'
    const state = parseSfen(sfen)
    // +R at row=7, col=0 (file 9)
    expect(state.board[7]![0]).toEqual({ type: 'rook', owner: 'sente', promoted: true })
  })

  it('should parse move count', () => {
    const sfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 42'
    const state = parseSfen(sfen)
    expect(state.moveCount).toBe(41)
  })

  it('should throw on invalid SFEN', () => {
    expect(() => parseSfen('invalid')).toThrow()
  })

  it('should be roundtrip consistent', () => {
    const original = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
    const state = parseSfen(original)
    expect(toSfen(state)).toBe(original)
  })
})

describe('moveToUsi', () => {
  it('should encode board move', () => {
    // 7六歩 (7g -> 7f): from={row:6, col:2}, to={row:5, col:2}
    const usi = moveToUsi({
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    })
    expect(usi).toBe('7g7f')
  })

  it('should encode promotion', () => {
    const usi = moveToUsi({
      type: 'move',
      from: { row: 3, col: 1 },
      to: { row: 0, col: 1 },
      promote: true,
    })
    expect(usi).toBe('8d8a+')
  })

  it('should encode drop move', () => {
    const usi = moveToUsi({
      type: 'drop',
      pieceType: 'pawn',
      to: { row: 4, col: 4 },
    })
    expect(usi).toBe('P*5e')
  })
})

describe('parseUsiMove', () => {
  it('should parse board move', () => {
    const move = parseUsiMove('7g7f')
    expect(move).toEqual({
      type: 'move',
      from: { row: 6, col: 2 },
      to: { row: 5, col: 2 },
      promote: false,
    })
  })

  it('should parse promotion move', () => {
    const move = parseUsiMove('8d8a+')
    expect(move).toEqual({
      type: 'move',
      from: { row: 3, col: 1 },
      to: { row: 0, col: 1 },
      promote: true,
    })
  })

  it('should parse drop move', () => {
    const move = parseUsiMove('P*5e')
    expect(move).toEqual({
      type: 'drop',
      pieceType: 'pawn',
      to: { row: 4, col: 4 },
    })
  })

  it('should be roundtrip consistent with moveToUsi', () => {
    const moves = ['7g7f', '8d8a+', 'P*5e', '1a1b', '9i9h']
    for (const usi of moves) {
      expect(moveToUsi(parseUsiMove(usi))).toBe(usi)
    }
  })
})
