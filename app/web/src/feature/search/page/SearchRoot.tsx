/**
 * Wrapper de página: inyecta las props (query, results) y arma el layout
 * de la feature. Punto único donde el route del router se enchufa a la
 * UI concreta.
 *
 * Hoy los datos vienen del mock `data/mockResults.ts`. Cuando el
 * backend exponga `GET /api/search`, esto se mueve a `useQuery` /
 * loader — sin tocar la forma del resto de la feature.
 */
import { searchResults } from '@/feature/search/data/mockResults'
import { SearchPage } from '@/feature/search/page/SearchPage'

export function SearchRoot() {
  return <SearchPage query="Sol Ring" results={searchResults} />
}
