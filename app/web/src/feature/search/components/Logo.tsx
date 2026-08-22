import logoUrl from '@/assets/scryland-logo.svg'

/**
 * Logo de Scryland.
 *
 * Renderiza el asset real (`src/assets/scryland-logo.svg`, entregado por
 * el diseñador) vía `<img>`. Vite lo emite con hash de contenido en el
 * build (no lo inlinea), y las dimensiones explícitas reservan el espacio
 * de layout desde el primer paint para mitigar el peso del archivo
 * (~1.7 MB). El favicon liviano ya existe por separado en `public/`.
 *
 * Sobre el logo se aplica un glow estático (`drop-shadow`) que, al hacer
 * hover, "respira" suavemente: el keyframe `logo-breathe` pulsa el
 * `filter` entre el valor base (0%/100%) y uno más intenso (50%). Al
 * quitar el mouse, la transición de `filter` devuelve el glow a su
 * estado base sin corte abrupto. Bajo `prefers-reduced-motion: reduce`
 * la animación se neutraliza.
 */
export default function Logo() {
  return (
    <>
      <style>{`
        @keyframes logo-breathe {
          0%, 100% { filter: drop-shadow(0 4px 20px oklch(0.64 0.20 302 / 0.55)) drop-shadow(0 0 10px oklch(0.93 0.05 210 / 0.30)); }
          50%      { filter: drop-shadow(0 4px 34px oklch(0.64 0.20 302 / 0.85)) drop-shadow(0 0 22px oklch(0.93 0.05 210 / 0.55)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-breathe:hover {
            animation: none !important;
          }
        }
      `}</style>

      <img
        src={logoUrl}
        alt="Scryland"
        width={299}
        height={168}
        className="logo-breathe h-42 w-auto transition-[filter] duration-300 ease-in-out [filter:drop-shadow(0_4px_20px_oklch(0.64_0.20_302/0.55))_drop-shadow(0_0_10px_oklch(0.93_0.05_210/0.30))] hover:animate-[logo-breathe_1.4s_ease-in-out_infinite]"
      />
    </>
  )
}
