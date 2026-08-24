import type { SearchResponse } from '@scryland/shared'

const SEARCH_ENDPOINT = '/api/search'

/**
 * Consulta `GET /api/search?q=` del backend (vía proxy de Vite en dev) y
 * devuelve la respuesta tipada con `SearchResponse`. Usa `fetch` nativo,
 * sin librerías. Lanza si la red falla o la respuesta no es exitosa, para
 * que `useQuery` la capture como estado `error`.
 */
export async function fetchSearch(query: string): Promise<SearchResponse> {
  const url = `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Search request failed with status ${response.status}`)
  }

  return (await response.json()) as SearchResponse
}
