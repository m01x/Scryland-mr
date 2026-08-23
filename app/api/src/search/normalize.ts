import { Logger } from '@nestjs/common';

/**
 * Normalización de cartas a `printKey` y parseo de `title` + `body`.
 *
 * El `title` de las tiendas Shopify sigue el formato:
 *   `Name [Set]`  o  `Name (variante) [Set]`
 * (ej. `Sol Ring [Fallout]`, `Sol Ring (Borderless) [Fallout]`,
 * `Sol Ring (0910) [Secret Lair Drop Series]`).
 *
 * El `body` es el HTML crudo del producto y aporta dos datos estables que el
 * `title` no garantiza:
 *   - `data-tcgid="..."` — ID de TCGPlayer, idéntico cross-store para el mismo
 *     print. Es la fuente primaria del `printKey`.
 *   - la celda `<td>Set:</td>` — nombre del set sin depender de corchetes.
 *
 * El `title` sigue siendo la fuente de `cardName` y `variant`. Si falta `tcgid`
 * (tienda que deja de emitirlo), se cae a un `printKey` derivado del título.
 *
 * Nunca se hardcodean nombres de cartas ni de sets.
 */

const logger = new Logger('Normalize');

export interface ParsedTitle {
  /** Nombre de la carta sin variante (recortado). */
  cardName: string;
  /** Variantes `(...)` entre el nombre y el set, concatenadas en orden ('' si no hay). */
  variant: string;
  /** Set: `body` si existe, si no el bracket del `title`. */
  set: string;
  /** Etiqueta para la UI: `variant · set` si hay variante, si no solo `set`. */
  editionLabel: string;
  /** Clave de agrupación cross-store: `tcg:<tcgid>` si hay tcgid, si no `norm(cardName)|norm(variant)|norm(set)`. */
  printKey: string;
}

/** Partes que se extraen exclusivamente del `title`. */
export interface TitleParts {
  cardName: string;
  variant: string;
  /** Contenido del último `[...]` del title ('' si no hay). */
  titleSet: string;
}

/** Datos que se extraen del `body` HTML del producto. */
export interface BodyParts {
  tcgid: string | null;
  set: string | null;
}

/**
 * Normaliza un token (cardName / variant / set) a una clave estable:
 * strip de diacríticos → lowercase → puntuación/separadores a espacio →
 * trim + colapso de espacios → espacios a guion.
 */
export function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

/** `printKey` (fallback) = `norm(cardName)|norm(variant || '')|norm(set)`. */
export function buildPrintKey(
  cardName: string,
  variant: string,
  set: string,
): string {
  return [
    normalizeToken(cardName),
    normalizeToken(variant),
    normalizeToken(set),
  ].join('|');
}

/**
 * Parsea un `title` crudo en sus partes.
 *
 * - `titleSet` = contenido del **último** `[ ... ]`.
 * - `variant` = todos los `( ... )` entre el nombre y el set, concatenados en
 *   orden (se conservan: son prints distintos).
 * - `cardName` = texto restante sin variantes, con espacios colapsados.
 */
export function parseTitle(title: string): TitleParts {
  const trimmed = title.trim();

  const setMatch = trimmed.match(/\[([^\]]*)\]\s*$/);
  const titleSet = setMatch ? setMatch[1].trim() : '';

  const namePart = setMatch ? trimmed.slice(0, setMatch.index).trim() : trimmed;

  const variants = Array.from(namePart.matchAll(/\(([^)]*)\)/g))
    .map((m) => m[1].trim())
    .filter((v) => v.length > 0);

  const cardName = namePart
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { cardName, variant: variants.join(' '), titleSet };
}

/**
 * Parsea el `body` HTML crudo del producto.
 *
 * - `tcgid` = `data-tcgid="..."` (ID de TCGPlayer); `null` si no matchea.
 * - `set` = celda `<td>Set:</td> ...` (case-insensitive, trim); `null` si no.
 */
export function parseBody(body: string | null | undefined): BodyParts {
  if (body === null || body === undefined) {
    return { tcgid: null, set: null };
  }

  const tcgidMatch = body.match(/data-tcgid="([^"]*)"/);
  const tcgid = tcgidMatch ? tcgidMatch[1].trim() : null;

  const setMatch = body.match(/<td>Set:<\/td>\s*<td>([^<]+)<\/td>/i);
  const set = setMatch ? setMatch[1].trim() : null;

  return { tcgid, set };
}

/**
 * Normaliza un print a partir de `title` + `body`.
 *
 * - `cardName` y `variant` salen del `title`.
 * - `set` = `bodySet ?? titleSet` (el `body` es la fuente primaria).
 * - `printKey` = `tcg:<tcgid>` si hay tcgid; si no, cae al fallback
 *   `buildPrintKey(cardName, variant, set)` (que conserva `variant`).
 * - Si no hay `tcgid`, se emite un `Logger.warn` con el `handle` para detectar
 *   si una tienda deja de emitirlo.
 */
export function normalizePrint(
  title: string,
  body: string | null | undefined,
  handle?: string,
): ParsedTitle {
  const { cardName, variant, titleSet } = parseTitle(title);
  const { tcgid, set: bodySet } = parseBody(body);

  const set = bodySet ?? titleSet;
  const editionLabel = variant ? `${variant} · ${set}` : set;

  let printKey: string;
  if (tcgid) {
    printKey = `tcg:${tcgid}`;
  } else {
    printKey = buildPrintKey(cardName, variant, set);
    logger.warn(
      `Product without tcgid, falling back to title-derived printKey (handle=${handle ?? 'unknown'})`,
    );
  }

  return { cardName, variant, set, editionLabel, printKey };
}

/**
 * `price` string → entero. Siempre `parseInt(..., 10)` (aun si
 * `available=false`); si no es parseable devuelve `null`.
 */
export function parsePrice(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Query normalizada para la clave de cache: lowercase + trim + colapso de
 * espacios. `"Sol Ring"`, `"SOL   RING"` y `" sol ring "` comparten clave.
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}
