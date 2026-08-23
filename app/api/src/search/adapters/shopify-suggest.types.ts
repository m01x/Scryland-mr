/**
 * Tipado del shape crudo de `/search/suggest.json` de Shopify (solo los campos
 * que la v1 consume). Los parseos defensivos viven en `normalize.ts`.
 */

export interface ShopifyFeaturedImage {
  url?: string;
  alt?: string | null;
  width?: number;
  height?: number;
  aspect_ratio?: number;
}

export interface ShopifyProduct {
  /** `"Sol Ring [Fallout]"` o `"Sol Ring (Borderless) [Fallout]"`. */
  title: string;
  /** Slug del producto (`sol-ring-fallout`). Puede discrepar del título. */
  handle: string;
  /** Precio (string entero CLP) de la variante más barata. */
  price: string;
  price_min?: string;
  price_max?: string;
  /** Disponibilidad a nivel de producto. */
  available: boolean;
  /** HTML crudo del producto; contiene `data-tcgid` y la tabla `Set:`. */
  body?: string;
  /** `"MTG Single"` para singles; otras categorías se descartan. */
  type?: string;
  vendor?: string;
  tags?: string[];
  url?: string;
  featured_image?: ShopifyFeaturedImage;
}

export interface ShopifySuggestProducts {
  products: ShopifyProduct[];
}

export interface ShopifySuggestResponse {
  resources: {
    results: ShopifySuggestProducts;
  };
}
