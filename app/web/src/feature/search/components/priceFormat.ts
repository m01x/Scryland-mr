/**
 * Formateador de precios.
 *
 * Recibe `price: number | null` y `currency: string`. Currency hoy es
 * siempre "CLP" en los mocks; si el contrato usa otra sigla, la
 * formateamos en consecuencia. La salida es human-readable alineada
 * con el mockup ("$12.000" — separador de miles con punto).
 *
 * Devuelve un em-dash cuando el precio es `null` (caso sin stock), pero
 * la UI raramente llamará con `null` aquí — la columna precio tiene
 * su propia presentación ("Sin stock"). Mantenemos este helper
 * defensivo.
 */
export function formatPrice(
  price: number | null,
  currency: string,
): string {
  if (price === null) return '—'

  if (currency === 'CLP') {
    return `$${price.toLocaleString('es-CL')}`
  }

  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString('es-CL')}`
  }
}
