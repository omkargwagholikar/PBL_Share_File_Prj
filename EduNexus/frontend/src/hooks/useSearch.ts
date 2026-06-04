import { useQuery, keepPreviousData } from '@tanstack/react-query'
import client, { endpoints } from '@/lib/api'
import type { SearchResponse, SearchFilters } from '@/types'

export function useSearch(query: string, filters: SearchFilters) {
  return useQuery<SearchResponse>({
    queryKey: ['search', query, filters],
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params: Record<string, string> = { q: query }
      if (filters.subject) params.subject = filters.subject
      if (filters.semester) params.semester = filters.semester
      if (filters.file_type) params.file_type = filters.file_type
      if (filters.mode) params.mode = filters.mode
      const { data } = await client.get<SearchResponse>(endpoints.search, { params })
      return data
    },
  })
}

export function useSuggestions(prefix: string) {
  return useQuery<string[]>({
    queryKey: ['suggest', prefix],
    enabled: prefix.trim().length > 1,
    queryFn: async () => {
      const { data } = await client.get<{ suggestions: string[] }>(endpoints.suggest, {
        params: { q: prefix },
      })
      return data.suggestions
    },
  })
}
