import { getIdToken } from '@/auth/auth'

const MAIN_BASE_URL =
  import.meta.env.VITE_MAIN_API_BASE_URL || '/api/v1/main'
const ANALYSIS_BASE_URL =
  import.meta.env.VITE_ANALYSIS_API_BASE_URL || '/api/v1/analysis'

export const mainFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  return customFetch<T>(MAIN_BASE_URL, url, options)
}

export const analysisFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  return customFetch<T>(ANALYSIS_BASE_URL, url, options)
}

async function customFetch<T>(
  baseUrl: string,
  url: string,
  options: RequestInit,
): Promise<T> {
  const targetUrl = `${baseUrl}${url}`

  const res = await fetch(targetUrl, {
    ...options,
    headers: {
      Authorization: `Bearer ${getIdToken()}`,
      ...options.headers,
    },
  })

  if (res.status === 204) {
    return { data: undefined, status: 204, headers: res.headers } as T
  }
  const data = await res.json()
  return { data, status: res.status, headers: res.headers } as T
}
