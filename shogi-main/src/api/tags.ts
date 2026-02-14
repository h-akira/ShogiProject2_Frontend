import type {
  Tag,
  TagDetail,
  TagCreateRequest,
  TagUpdateRequest,
} from '@/types/api'
import { mockTags, mockTagDetails } from './mock-data'

let tagStore: Tag[] = [...mockTags]
let tagDetailStore: TagDetail[] = [...mockTagDetails]

export async function getTags(): Promise<{ items: Tag[] }> {
  return { items: [...tagStore] }
}

export async function getTag(tid: string): Promise<TagDetail> {
  const detail = tagDetailStore.find((t) => t.tid === tid)
  if (!detail) throw new Error(`Tag not found: ${tid}`)
  return { ...detail }
}

export async function createTag(req: TagCreateRequest): Promise<Tag> {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const tid = `tag${String(tagStore.length + 1).padStart(3, '0')}`
  const newTag: Tag = {
    tid,
    name: req.name,
    created: now,
    latest_update: now,
  }
  tagStore.push(newTag)
  tagDetailStore.push({ ...newTag, kifus: [], kifu_count: 0 })
  return { ...newTag }
}

export async function updateTag(
  tid: string,
  req: TagUpdateRequest,
): Promise<Tag> {
  const idx = tagStore.findIndex((t) => t.tid === tid)
  if (idx === -1) throw new Error(`Tag not found: ${tid}`)
  const existing = tagStore[idx]!
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const updated: Tag = { ...existing, name: req.name, latest_update: now }
  tagStore[idx] = updated
  const detailIdx = tagDetailStore.findIndex((t) => t.tid === tid)
  if (detailIdx !== -1) {
    const existingDetail = tagDetailStore[detailIdx]!
    tagDetailStore[detailIdx] = {
      ...existingDetail,
      name: req.name,
      latest_update: now,
    }
  }
  return { ...updated }
}

export async function deleteTag(tid: string): Promise<void> {
  tagStore = tagStore.filter((t) => t.tid !== tid)
  tagDetailStore = tagDetailStore.filter((t) => t.tid !== tid)
}
