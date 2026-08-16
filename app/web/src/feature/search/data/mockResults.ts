import type { SearchResult, StoreOffer } from '@scryland/shared'

/**
 * Datos de maqueteo para la pantalla de búsqueda.
 *
 * Cuatro ediciones de "Sol Ring" alineadas con el mockup
 * `samples/frontend/SampleConcept.png`:
 *
 * 1. Commander Masters (2023) — INEKO cheapest, P2W +20 CLP, Catlotus sin stock.
 * 2. Revised Edition — P2W cheapest y destacado (variant `accent`).
 * 3. 30th Anniversary — INEKO cheapest, P2W sin stock, Catlotus caro.
 * 4. Sin edición disponible — todas las tiendas sin stock. Sin bestPrice.
 *
 * Los IDs son estables para keys de React. La moneda `CLP` es ficticia
 * hasta que el backend defina el contrato, pero se alinea con el
 * pseudocódigo "12.000" del mockup (separador de miles).
 */
export const searchResults: SearchResult[] = [
  {
    id: 'sol-ring-cmm-2023',
    cardName: 'Sol Ring',
    set: 'Commander Masters',
    editionLabel: 'Commander Masters · 2023',
    bestPrice: 12000,
    offers: [
      bestOffer('ineko', 12000),
      offer('p2w', 12020),
      unavailableOffer('catlotus'),
    ],
  },
  {
    id: 'sol-ring-rev',
    cardName: 'Sol Ring',
    set: 'Revised Edition',
    editionLabel: 'Revised Edition',
    bestPrice: 14990,
    offers: [
      offer('ineko', 15500),
      bestOffer('p2w', 14990),
      offer('catlotus', 16200),
    ],
  },
  {
    id: 'sol-ring-30a',
    cardName: 'Sol Ring',
    set: '30th Anniversary',
    editionLabel: '30th Anniversary',
    bestPrice: 42000,
    offers: [
      bestOffer('ineko', 42000),
      unavailableOffer('p2w'),
      offer('catlotus', 45000),
    ],
  },
  {
    id: 'sol-ring-unavailable',
    cardName: 'Sol Ring',
    set: 'Sin edición disponible',
    editionLabel: 'Sin edición disponible',
    bestPrice: null,
    offers: [
      unavailableOffer('ineko'),
      unavailableOffer('p2w'),
      unavailableOffer('catlotus'),
    ],
  },
]

function offer(store: string, price: number): StoreOffer {
  return {
    store,
    price,
    currency: 'CLP',
    available: true,
  }
}

function bestOffer(store: string, price: number): StoreOffer {
  return offer(store, price)
}

function unavailableOffer(store: string): StoreOffer {
  return {
    store,
    price: null,
    currency: 'CLP',
    available: false,
  }
}
