<script setup lang="ts">
import type { PieceType, Player } from '../core/types'
import { PIECE_KANJI } from '../core/constants'

const props = defineProps<{
  type: PieceType
  owner: Player
  promoted: boolean
  flipped: boolean
}>()

const displayChar = () => {
  const entry = PIECE_KANJI[props.type]
  return props.promoted ? entry.promoted : entry.normal
}
</script>

<template>
  <span
    class="piece"
    :class="{
      rotated: (owner === 'gote') !== flipped,
      promoted: promoted,
    }"
    >{{ displayChar() }}</span
  >
</template>

<style scoped>
.piece {
  font-size: 1.6em;
  font-weight: bold;
  line-height: 1;
  color: #1a1a1a;
  user-select: none;
  pointer-events: none;
}

.piece.rotated {
  transform: rotate(180deg);
  display: inline-block;
}

.piece.promoted {
  color: #c00;
}
</style>
