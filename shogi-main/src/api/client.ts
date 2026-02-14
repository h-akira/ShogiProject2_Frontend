// API client stub
// Currently returns mock data directly.
// Will be replaced with fetch + Authorization header when backend is ready.

const USE_MOCK = true

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export async function apiGet<T>(path: string, _params?: Record<string, string>): Promise<T> {
  if (USE_MOCK) {
    throw new Error(`Mock not implemented for GET ${path}`)
  }
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  if (_params) {
    Object.entries(_params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer TODO_ACCESS_TOKEN` },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, _body?: unknown): Promise<T> {
  if (USE_MOCK) {
    throw new Error(`Mock not implemented for POST ${path}`)
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer TODO_ACCESS_TOKEN`,
      'Content-Type': 'application/json',
    },
    body: _body ? JSON.stringify(_body) : undefined,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiPut<T>(path: string, _body?: unknown): Promise<T> {
  if (USE_MOCK) {
    throw new Error(`Mock not implemented for PUT ${path}`)
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer TODO_ACCESS_TOKEN`,
      'Content-Type': 'application/json',
    },
    body: _body ? JSON.stringify(_body) : undefined,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiDelete(path: string, _body?: unknown): Promise<void> {
  if (USE_MOCK) {
    throw new Error(`Mock not implemented for DELETE ${path}`)
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer TODO_ACCESS_TOKEN`,
      'Content-Type': 'application/json',
    },
    body: _body ? JSON.stringify(_body) : undefined,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}
