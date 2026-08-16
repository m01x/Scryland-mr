# AGENTS.md — Raíz (Orquestador)
 
Este archivo es el patrón del repo. La sesión de OpenCode se abre en la raíz y opera como **orquestador**: conversa con el usuario, redacta specs, mantiene `shared/` y `.spec/`, delega en los workers y documenta en Notion.
 
## Qué es Scryland
 
Scryland es un portal comparador de precios de cartas de Magic: The Gathering entre tiendas online chilenas, inspirado en el modelo de Solotodo. El usuario busca una carta (por nombre o print/edición) y Scryland muestra en qué tiendas está disponible y a qué precio, con un link directo al producto en la tienda real para completar la compra ahí.
 
**Tiendas objetivo (v1):** Ineko y Paytowin (Shopify). Catlotus queda fuera del scraping automatizado (robots.txt en `cartas.catlotus.cl`).
 
## Principios de diseño
 
- **Respeto a las tiendas fuente**: sin scraping agresivo, robots.txt se respeta siempre, cache para minimizar carga repetida.
- **Un print, una card**: cada print (nombre + set + variante) es una entidad propia; no se agrupan ediciones bajo un solo precio.
- **Deep-linking, no checkout propio**: Scryland no vende ni gestiona carritos; lleva al producto exacto en la tienda real.
## Stack
 
La forma del proyecto es estable; las versiones y dependencias **no se documentan aquí**. Al iniciar sesión, léelas de la fuente:
 
| Qué | Dónde se lee |
|-----|--------------|
| Workspaces activos | `pnpm-workspace.yaml` |
| Versión de Node | `.nvmrc` y `engines` del `package.json` raíz |
| Versión de pnpm | `packageManager` del `package.json` raíz |
| Scripts disponibles | `scripts` del `package.json` raíz |
| Dependencias de cada worker | `app/<worker>/package.json` |
| Variables de entorno | `.env.example` |
 
Forma fija (esto sí es decisión, no dato):
 
- Monorepo único con **pnpm workspaces**, un solo `.git` y un solo lockfile en la raíz.
- **Backend**: NestJS en `app/api` (`@scryland/api`).
- **Frontend**: React + TanStack en `app/web` (`@scryland/web`).
- **Contratos**: `shared/` (`@scryland/shared`) — tipos/DTOs puros, fuente de verdad del contrato entre frontend y backend.
- **Scope de paquetes**: `@scryland/*`.
Si lo que lees en disco contradice esta forma, no la corrijas por tu cuenta: repórtalo.
 
## Patrón de trabajo: orquestador-trabajador + Spec-Driven Design (SDD)
 
- **Orquestador** — esta sesión, en la raíz. Único autorizado a escribir en `.spec/`, `shared/`, `e2e/` y archivos raíz. No escribe código de producto dentro de `app/api` ni `app/web`.
- **Workers aislados** — `app/api` (NestJS) y `app/web` (React + TanStack). Cada uno con su propio `AGENTS.md` local; escriben únicamente dentro de su carpeta.
- **`shared/`** — interfaces puras (sin decoradores de Nest). Si un lado usa un campo que no existe ahí, no compila. Solo lectura para los workers.
- **`.spec/`** — `State.md`, cada spec numerada y los formatos de referencia. Solo el orquestador escribe aquí.
  - `.spec/Simple-Spec-format.md` — formato de spec simple.
  - `.spec/Orchestrator-Spec-format.md` — formato de spec tipo orquestador (con bloques de tarea por agente).
  - `.spec/Notion-format.md` — cómo documentar en Notion con formato uniforme.
- **`e2e/`** — Playwright en la raíz, territorio del orquestador (cruza frontend y backend juntos).
**Regla dura:** frontend nunca toca código de backend y viceversa — solo lectura para observar, nunca escritura.
 
## Flujo de specs
 
Cuatro estados, dos de ellos finales. Ninguna spec nueva se abre si la anterior no está en un estado final. Los estados se reconocen tanto en español como en inglés:
 
| Estado | Significado | Quién lo marca |
|--------|-------------|----------------|
| Borrador (Draft) | Requerimiento redactado, no autorizado | Orquestador |
| Aprobado (Approved) | Borradores listos y revisados; recién aquí se escribe código | El usuario, manualmente |
| Implementado (Implemented) — final | Código hecho, revisado y aceptado | El usuario, tras revisión |
| Obsoleto (Obsolete) — final | Descartado o pausado indefinidamente | El usuario |
 
**Reglas**
 
- Antes de crear una spec nueva, la anterior debe estar en **Implementado** u **Obsoleto**.
- Solo se implementan specs en estado **Aprobado**; la aprobación es manual y humana. Ningún agente se autoaprueba.
- `State.md` lo escribe únicamente el orquestador. Los workers reportan que terminaron; el orquestador registra.
- Entre Aprobado e Implementado se distingue con un flag de *listo para revisión* en `State.md` (no se agrega un quinto estado).
- A Notion solo entran specs en estado final.
## Ciclo de ejecución del orquestador
 
Este es el flujo que sigue el orquestador desde que el usuario describe un requerimiento. Cada paso marcado como **[HUMANO]** se detiene y espera respuesta: no se avanza por iniciativa propia.
 
### 1. Puerta de entrada
 
El usuario describe una spec → revisar `State.md`:
 
- Si la última spec **no** está en estado final (Implementado u Obsoleto): **detenerse** y pedir resolver la spec anterior primero.
- Si está cerrada: continuar.
### 2. Clasificación
 
El orquestador decide el tipo de spec y lo propone:
 
- **Spec simple** — un solo territorio (solo `app/api`, solo `app/web`, o solo raíz/`shared`), alcance acotado, sin coordinación cruzada. Se redacta con `.spec/Simple-Spec-format.md`.
- **Spec tipo orquestador** — toca dos o más territorios, o requiere que dos o más agentes trabajen en paralelo. Se redacta con `.spec/Orchestrator-Spec-format.md`: `Estado` de nivel superior para el documento completo y un `Estado` propio e independiente por cada bloque de tarea de agente.
### 3-A. Ruta spec simple
 
1. Orquestador crea la spec en `.spec/` en estado **Borrador**.
2. **[HUMANO]** Aprobación. Si no aprueba → se reescribe con el feedback y se vuelve a presentar. El ciclo se repite hasta aprobar.
3. Aprobada → el orquestador ejecuta la spec y va marcando sus propias tareas dentro del documento.
4. **[HUMANO]** Revisión del resultado. No conforme → el feedback vuelve al paso 3 (se retoma la ejecución, no se reescribe la spec). Conforme → sigue.
5. **[HUMANO]** El usuario marca la spec como **Implementado**.
6. Orquestador documenta en Notion según `.spec/Notion-format.md` y actualiza `State.md`.
### 3-B. Ruta spec tipo orquestador
 
1. Orquestador crea la spec tipo orquestador en `.spec/` en estado **Borrador**, con las tareas ya desglosadas por agente.
2. **[HUMANO]** Aprobación. Si no aprueba → se reescribe y se vuelve a presentar.
3. Aprobada → se cargan las tareas específicas y se despacha a los subagentes (dos o más posibles). Cada tarea se despacha al subagente cuyo territorio corresponde: **`backend`** → `app/api`, **`web`** → `app/web` (definidos en `opencode.json`, `mode: all`). El orquestador despacha **en paralelo**: una sola respuesta con una llamada a la herramienta `task` por subagente.
4. Cada agente resuelve **solo sus propias tareas**, dentro de su carpeta, apoyándose en sus skills locales.
5. Orquestador consolida las respuestas cuando todos los agentes terminan.
6. Orquestador actualiza la spec marcando los checks de las tareas de cada agente.
7. **[HUMANO]** Revisión. No conforme → el feedback vuelve al paso 3 (se recargan tareas específicas para el agente que corresponda). Conforme → sigue.
8. **[HUMANO]** El usuario marca la spec como **Implementado**.
9. Orquestador documenta en Notion según `.spec/Notion-format.md` y actualiza `State.md`.
> Una spec implementada está cumplida. El usuario puede marcarla **Obsoleta** más adelante si la desestima.
 
## Delegación a workers

El despacho se hace con la herramienta `task` indicando `subagent_type`: `backend` o `web`. Cuando hay más de un worker, se lanzan en paralelo (una sola respuesta, una llamada `task` por subagente); el orquestador consolida cuando todos terminan. Al despachar una tarea, el orquestador entrega en el prompt:
 
- Ruta de la spec y el **bloque de tarea específico** que le corresponde (no la spec completa como mandato).
- Qué archivos de `shared/` son el contrato relevante.
- Criterios de aceptación de ese bloque.
- Recordatorio del límite de escritura: solo su carpeta.
El orquestador **no** acepta que un worker:
 
- Escriba fuera de su carpeta.
- Edite `shared/`, `.spec/`, `State.md` o archivos raíz.
- Se autoapruebe una tarea o cambie el `Estado` de una spec.
- Instale dependencias no contempladas en la spec sin reportarlo primero.
Si un worker reporta que necesita cambiar el contrato de `shared/`, el orquestador detiene la tarea, evalúa el cambio, lo aplica él mismo (o abre spec si es grande) y recién ahí reanuda.
 
## Skills de los agentes
 
- Cada worker tiene sus skills en `<carpeta>/.agents/skills/` (generadas con el proyecto *autoskills*). `.claude/skills/` es un espejo generado: **no se edita a mano ninguno de los dos**.
- `skills-lock.json` en cada worker registra las skills instaladas. Lo administra la herramienta, no el agente.
- El orquestador puede leer las skills de los workers para saber qué convenciones esperar, pero no las escribe.
- Las skills se irán poblando a medida que crezca el proyecto; que una skill no exista todavía no bloquea una tarea.
## Convenciones del repo
 
- **Versiones**: Node y pnpm se fijan en `engines`, `.nvmrc` y `packageManager`; se activan vía `corepack`. No se documentan aquí.
- **Nest y React**: lo que instale su CLI al momento del scaffold. No se fijan versiones a mano.
- **Puertos y variables de entorno**: viven en `.env.example`, no en documentos.
- **Scripts**: los del `package.json` raíz. No los memorices, léelos.
- **Consistencia**: estructura en disco, documentación en Notion e instrucciones de agentes deben coincidir. Cualquier divergencia se reporta antes de seguir.
El flujo de specs de este repo es el descrito en este documento. Ninguna skill externa lo reemplaza ni lo reinterpreta.
## Estado actual
 
No se documenta aquí: quedaría desactualizado al primer commit. Para saber dónde va el proyecto, lee al inicio de cada sesión:
 
1. **`.spec/State.md`** — la tabla de specs y sus estados. Es la fuente de verdad de qué está cerrado y qué está abierto.
2. **La última spec de `.spec/`** — su alcance y sus criterios de aceptación dicen qué se acaba de construir o se está construyendo.
3. **`pnpm-workspace.yaml` y el árbol de `app/`** — qué workspaces existen realmente hoy.
Antes de proponer una spec nueva, este chequeo es obligatorio: sin `State.md` leído no se sabe si la puerta de entrada está abierta.

