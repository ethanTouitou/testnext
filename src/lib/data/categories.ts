import { apiGet } from '@/lib/api/client'
import type { Category } from '@/lib/api/types'

// L'API exige aussi le token pour lire les catégories.
export async function getCategories(token: string) {
  return apiGet<Category[]>('/categories', token)
}
