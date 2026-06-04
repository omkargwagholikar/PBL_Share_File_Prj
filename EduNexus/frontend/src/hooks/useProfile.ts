import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '@/lib/api'

export type ProfileResponse = {
  uid: string
  hf_token_set: boolean
  hf_token_preview: string
  default_embedding_model: string
  last_download_status: string
  last_download_message: string
  last_download_at: string | null
  updated_at: string | null
}

export type ProfileUpdate = {
  hf_token?: string
  default_embedding_model?: string
}

export type ModelDownloadResult = {
  ok: boolean
  model_id: string
  local_path?: string
  downloaded_at?: string
  error?: string
}

export function useProfile() {
  return useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await client.get<ProfileResponse>('/auth/profile/')
      return data
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation<ProfileResponse, Error, ProfileUpdate>({
    mutationFn: async (body) => {
      const { data } = await client.put<ProfileResponse>('/auth/profile/', body)
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data)
    },
  })
}

export function useDownloadModel() {
  const qc = useQueryClient()
  return useMutation<ModelDownloadResult, Error, { model_id?: string }>({
    mutationFn: async (body) => {
      const { data } = await client.post<ModelDownloadResult>(
        '/auth/profile/download-model/',
        body,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
