import type { ShopifyFeaturedImage } from './shopify-suggest.types';

/**
 * Tipado del shape crudo de `/products/<handle>.js` de Shopify (BinderPOS), que
 * ineko y paytowin comparten. Solo los campos que consume el adapter de detalle;
 * los parseos defensivos viven en `product-parsing.ts` y nunca rompen.
 */

export interface ShopifyProductVariant {
  /** Id numérico de la variante (para el deep-link `?variant=<id>`). */
  id?: number;
  /** SKU `<SET>-<NUM>-<LANG>-<FINISH>-<COND>`; fuente de verdad de condición/idioma/foil. */
  sku?: string | null;
  /** Disponibilidad por variante (fuente de verdad de stock). */
  available?: boolean;
  /** Precio en centavos (`538000` = $5.380). Puede venir string o número. */
  price?: string | number | null;
  /** Título concatenado de la variante (`"Near Mint Foil Spanish"`). */
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
}

export interface ShopifyProductDetail {
  /** Slug del producto. */
  handle?: string;
  /** Lista de opciones (una sola en ineko/paytowin: `["Title"]`). */
  options?: string[];
  variants?: ShopifyProductVariant[];
  featured_image?: ShopifyFeaturedImage;
}
