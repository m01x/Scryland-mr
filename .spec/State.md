# State

| Spec | Estado | Listo para revisión | Última revisión |
|------|--------|---------------------|-----------------|
| Spec 00 - Scaffold del backend | Implementado | — | 2026-08-14 |
| Spec 01 - Consolidación Shared y Convención de Specs | Implementado | — | 2026-08-15 |
| Spec 02 - Scaffold del frontend | Implementado | — | 2026-08-16 |
| Spec 03 - Carpintería de frontend y base de API | Implementado | — | 2026-08-16 |
| Spec 04 - Limpieza post-carpintería | Implementado | — | 2026-08-16 |
| Spec 05 - UI de búsqueda de Scryland | Implementado | — | 2026-08-16 |
| Spec 06 - Reestructuración shadcn, logo real y nav WatchTower | Implementado | — | 2026-08-18 |
| Spec 07 - Fuente local "Basic", infra de consulta y Playwright E2E | Implementado | — | 2026-08-22 |
| Spec 08 - Limpieza de lint del backend | Implementado | — | 2026-08-22 |
| Spec 09 - Búsqueda real contra tiendas | Implementado | — | 2026-08-22 |

## Deuda diferida

| Deuda | Spec objetivo |
|-------|---------------|
| `StoreOffer.url?: string` → `url: string` (requerido) | Spec 10 |
| `StoreOffer.store: string` → `StoreId` union (`ineko`/`paytowin`/`catlotus`) | Spec 10 |
| `SearchResult.bestPrice: number | null` → `bestPrice?: number` (ausente) | Spec 10 |
| UI rotula "desde $X" (price es el mínimo de variantes) | Spec 10 |
| Detalle de variantes vía `/products/<handle>.js` | futura |
| Traducción ES→EN vía Scryfall | futura |
