import logoUrl from '@/assets/scryland-logo.svg'

/**
 * Logo de Scryland.
 *
 * Renderiza el asset real (`src/assets/scryland-logo.svg`, entregado por
 * el diseñador) vía `<img>`. Vite lo emite con hash de contenido en el
 * build (no lo inlinea), y las dimensiones explícitas reservan el espacio
 * de layout desde el primer paint para mitigar el peso del archivo
 * (~1.7 MB). El favicon liviano ya existe por separado en `public/`.
 */
export default function Logo() {
  return (
    <img
      src={logoUrl}
      alt="Scryland"
      width={299}
      height={168}
      className="h-42 w-auto drop-shadow-[0_4px_18px_oklch(0.64_0.20_302/0.45)]"
    />
  )
}
