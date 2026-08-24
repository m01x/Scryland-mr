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
| Spec 10 - Conexión del frontend con la búsqueda real | Implementado | — | 2026-08-23 |

## Deuda diferida

| Deuda | Spec objetivo |
|-------|---------------|
| Precio real por variante: `price` de `suggest.json` es `price_min` (condición más barata, ej. Damaged, o idioma/foil) ⇒ "desde $X" engañoso; leer condición/idioma/foil por variante vía `/products/<handle>.js` (ineko) / `.json` (paytowin) | Spec 11 |
| Traducción ES→EN vía Scryfall | futura |
| Límite de ~10 productos por query de `suggest.json` | futura |
