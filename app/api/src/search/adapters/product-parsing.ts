import type { CardCondition, CardFinish } from '@scryland/shared';

/**
 * Parseos del detalle de producto de Shopify (BinderPOS). La fuente de verdad
 * es el SKU (`<SET>-<NUM>-<LANG>-<FINISH>-<COND>`); si no matchea el patrón se
 * cae al `option1` (título concatenado) y se deja en `null` lo no derivable.
 * Nunca se lanza: ante cualquier forma inesperada se devuelven `null`s.
 */

export interface ParsedVariantAttributes {
  condition: CardCondition | null;
  language: string | null;
  finish: CardFinish | null;
}

const CONDITION_BY_CODE: Record<string, CardCondition> = {
  '1': 'Near Mint',
  '2': 'Lightly Played',
  '3': 'Moderately Played',
  '4': 'Heavily Played',
  '5': 'Damaged',
};

const FINISH_BY_CODE: Record<string, CardFinish> = {
  NF: 'normal',
  FO: 'foil',
};

const CONDITION_KEYWORDS: Array<[string, CardCondition]> = [
  ['near mint', 'Near Mint'],
  ['lightly played', 'Lightly Played'],
  ['moderately played', 'Moderately Played'],
  ['heavily played', 'Heavily Played'],
  ['damaged', 'Damaged'],
];

/**
 * Parsea el SKU `<SET>-<NUM>-<LANG>-<FINISH>-<COND>`. `LANG` es un código de 2
 * chars, `FINISH` es `NF`/`FO` y `COND` es `1..5`. Si el formato no matchea,
 * devuelve todo en `null` para que el llamador intente el fallback a `option1`.
 */
export function parseSku(
  sku: string | null | undefined,
): ParsedVariantAttributes {
  if (sku === null || sku === undefined) {
    return { condition: null, language: null, finish: null };
  }

  const parts = sku.split('-');
  if (parts.length < 5) {
    return { condition: null, language: null, finish: null };
  }

  const lang = parts[parts.length - 3];
  const finishCode = parts[parts.length - 2];
  const condCode = parts[parts.length - 1];

  const language = /^[A-Za-z]{2}$/.test(lang) ? lang.toUpperCase() : null;
  const finish = FINISH_BY_CODE[finishCode?.toUpperCase() ?? ''] ?? null;
  const condition = CONDITION_BY_CODE[condCode] ?? null;

  return { condition, language, finish };
}

/**
 * Fallback al SKU: deriva condición (keyword) y foil del `option1` (título
 * concatenado). El idioma no es derivable del título (es un nombre, no un
 * código de 2 chars), así que queda en `null`.
 */
export function parseOption1(
  option1: string | null | undefined,
): ParsedVariantAttributes {
  const title = (option1 ?? '').toLowerCase();

  let condition: CardCondition | null = null;
  for (const [keyword, value] of CONDITION_KEYWORDS) {
    if (title.includes(keyword)) {
      condition = value;
      break;
    }
  }

  const finish: CardFinish | null =
    title.length > 0 ? (title.includes('foil') ? 'foil' : 'normal') : null;

  return { condition, language: null, finish };
}

/**
 * Precio en centavos → CLP entero (división por 100). `538000` → `5380`.
 * `null` si no es parseable (o viene vacío); nunca `NaN`.
 */
export function parseCentsPrice(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const value = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value / 100;
}
