<script setup lang="ts">
import { computed } from 'vue'
import type { Board as BoardData, Position } from '../core/types'
import Square from './Square.vue'

const props = defineProps<{
  board: BoardData
  selectedPos: Position | null
  legalTargets: Position[]
  lastMove: { from: Position; to: Position } | null
  flipped: boolean
}>()

defineEmits<{
  squareClick: [pos: Position]
}>()

// Map display index to internal board index
function toRow(rowIdx: number): number {
  return props.flipped ? 8 - rowIdx : rowIdx
}

function toCol(colIdx: number): number {
  return props.flipped ? 8 - colIdx : colIdx
}

function isSelected(row: number, col: number): boolean {
  return !!props.selectedPos && props.selectedPos.row === row && props.selectedPos.col === col
}

function isLegalTarget(row: number, col: number): boolean {
  return props.legalTargets.some((t) => t.row === row && t.col === col)
}

function isLastMove(row: number, col: number): boolean {
  if (!props.lastMove) return false
  const { from, to } = props.lastMove
  return (from.row === row && from.col === col) || (to.row === row && to.col === col)
}

const rows = Array(9).fill(null)
const cols = Array(9).fill(null)

const FILE_LABELS_NORMAL = [9, 8, 7, 6, 5, 4, 3, 2, 1]
const FILE_LABELS_FLIPPED = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const RANK_LABELS_NORMAL = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
const RANK_LABELS_FLIPPED = ['九', '八', '七', '六', '五', '四', '三', '二', '一']

const fileLabels = computed(() => (props.flipped ? FILE_LABELS_FLIPPED : FILE_LABELS_NORMAL))
const rankLabels = computed(() => (props.flipped ? RANK_LABELS_FLIPPED : RANK_LABELS_NORMAL))
</script>

<template>
  <div class="board-wrapper" :class="{ flipped }">
    <!-- File labels (top in normal, bottom when flipped) -->
    <div v-if="!flipped" class="file-labels">
      <span v-for="f in fileLabels" :key="f" class="label">{{ f }}</span>
    </div>

    <div class="board-with-ranks">
      <!-- Rank labels (left side when flipped) -->
      <div v-if="flipped" class="rank-labels">
        <span v-for="(r, i) in rankLabels" :key="i" class="label">{{ r }}</span>
      </div>

      <!-- Board grid -->
      <div class="board">
        <template v-for="(_r, rowIdx) in rows" :key="rowIdx">
          <Square
            v-for="(_c, colIdx) in cols"
            :key="`${rowIdx}-${colIdx}`"
            :piece="board[toRow(rowIdx)]?.[toCol(colIdx)] ?? null"
            :is-selected="isSelected(toRow(rowIdx), toCol(colIdx))"
            :is-legal-target="isLegalTarget(toRow(rowIdx), toCol(colIdx))"
            :is-last-move="isLastMove(toRow(rowIdx), toCol(colIdx))"
            :flipped="flipped"
            :class="{
              'top-edge': rowIdx === 0,
              'bottom-edge': rowIdx === 8,
              'left-edge': colIdx === 0,
              'right-edge': colIdx === 8,
            }"
            @click="$emit('squareClick', { row: toRow(rowIdx), col: toCol(colIdx) })"
          />
        </template>
      </div>

      <!-- Rank labels (right side in normal) -->
      <div v-if="!flipped" class="rank-labels">
        <span v-for="(r, i) in rankLabels" :key="i" class="label">{{ r }}</span>
      </div>
    </div>

    <!-- File labels (bottom when flipped) -->
    <div v-if="flipped" class="file-labels">
      <span v-for="f in fileLabels" :key="f" class="label">{{ f }}</span>
    </div>
  </div>
</template>

<style scoped>
.board-wrapper {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
}

.file-labels {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  padding: 0 0 2px 0;
  /* Align with board width */
}

.file-labels .label {
  text-align: center;
  font-size: 0.75rem;
  color: #654321;
}

.board-with-ranks {
  display: flex;
  gap: 2px;
}

.board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  width: 100%;
  max-width: 450px;
  min-width: 315px;
  background: #dcb35c;
  border: 3px solid #8b4513;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.rank-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 0 2px;
}

.rank-labels .label {
  font-size: 0.75rem;
  color: #654321;
  line-height: 1;
}

/* Edge borders */
.top-edge {
  border-top-width: 2px;
}
.bottom-edge {
  border-bottom-width: 2px;
}
.left-edge {
  border-left-width: 2px;
}
.right-edge {
  border-right-width: 2px;
}
</style>
