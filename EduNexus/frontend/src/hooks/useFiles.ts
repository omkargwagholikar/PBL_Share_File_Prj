import { useQuery } from '@tanstack/react-query'
import client, { endpoints } from '@/lib/api'
import type { FileMeta } from '@/types'

export function useFiles() {
  return useQuery<FileMeta[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const { data } = await client.get<FileMeta[]>(endpoints.files)
      return data
    },
  })
}
