export type FileMeta = {
  id: number
  filename: string
  uploader: string
  uploaded_at: string
  size_bytes: number
  mime_type: string
  page_count: number | null
  keywords: string[]
  summary: string | null
  download_url: string
  thumbnail_url: string | null
  upvotes: number
  subject: string | null
  semester: string | null
  status: 'pending' | 'processing' | 'ready' | 'failed'
}

export type SearchHit = {
  file: FileMeta
  score: number
  matched_keywords: string[]
  page_anchor: number | null
  snippet: string
}

export type SearchResponse = {
  query: string
  total: number
  page: number
  page_size: number
  hits: SearchHit[]
  facets: {
    subjects: Array<{ value: string; count: number }>
    file_types: Array<{ value: string; count: number }>
    semesters: Array<{ value: string; count: number }>
  }
}

export type SearchFilters = {
  subject?: string
  semester?: string
  file_type?: string
  mode?: 'hybrid' | 'lexical' | 'semantic'
}

export type IngestionEvent = {
  file_id: number
  stage: 'queued' | 'extracting' | 'ocr' | 'embedding' | 'summarizing' | 'indexing' | 'ready' | 'failed'
  progress: number
  message?: string
}

export type AuthUser = {
  uid: string
  email: string | null
  display_name: string | null
  role: 'student' | 'moderator' | 'admin'
}
