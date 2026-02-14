import type { UserProfile } from '@/types/api'
import { mockUser } from './mock-data'

export async function getMe(): Promise<UserProfile> {
  return { ...mockUser }
}

export async function deleteAccount(_currentPassword: string): Promise<void> {
  // Mock: just resolve
}
