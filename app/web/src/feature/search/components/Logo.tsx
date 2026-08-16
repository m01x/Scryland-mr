/**
 * Logo de maqueteo de Scryland.
 *
 * SVG inline. La decisión de la spec es NO bundlearlo como asset:
 * mantiene el logo bajo el control del componente y evita inflar el
 * bundle con un PNG de ~2 MB que solo se usa aquí. Cuando el designer
 * entregue la versión de producción, se reemplaza este componente.
 *
 * Layout (mockup):
 * - Wordmark "SCRYLAND" en Cinzel, oro metálico (gradiente gold).
 * - Debajo, una silueta estilizada de torre sobre roca con diamante
 *   (no necesita ser fotorrealista; es un placeholder).
 *
 * El viewBox 220×140 deja espacio para escalar. `fill="currentColor"`
 * en el wordmark lo une al color del contenedor padre cuando hace
 * falta, y el gradiente dorado se aplica vía `<text>`.
 */
export default function Logo() {
  return (
    <div className="flex flex-col items-start gap-1 text-[oklch(0.80_0.12_82)]">
      <svg
        role="img"
        aria-label="Scryland"
        viewBox="0 0 220 100"
        className="h-14 w-auto drop-shadow-[0_4px_18px_oklch(0.64_0.20_302/0.45)]"
      >
        <defs>
          <linearGradient id="logo-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.92 0.10 88)" />
            <stop offset="50%" stopColor="oklch(0.80 0.12 82)" />
            <stop offset="100%" stopColor="oklch(0.58 0.10 70)" />
          </linearGradient>
          <linearGradient id="logo-stone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.04 70)" />
            <stop offset="100%" stopColor="oklch(0.30 0.03 70)" />
          </linearGradient>
          <linearGradient id="logo-gem" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.13 202)" />
            <stop offset="100%" stopColor="oklch(0.55 0.16 240)" />
          </linearGradient>
        </defs>

        <text
          x="110"
          y="46"
          textAnchor="middle"
          fontFamily="'Cinzel Variable', 'Cinzel', serif"
          fontWeight={700}
          fontSize={28}
          letterSpacing={6}
          fill="url(#logo-gold)"
        >
          SCRYLAND
        </text>

        <g transform="translate(58 56)">
          {/* Roca base */}
          <path
            d="M0 28 L4 22 L12 18 L20 12 L34 8 L48 10 L62 14 L78 12 L92 18 L104 26 L104 30 L0 30 Z"
            fill="url(#logo-stone)"
          />
          {/* Torre */}
          <path
            d="M44 28 L44 12 L52 6 L60 12 L60 28 Z"
            fill="url(#logo-stone)"
            stroke="oklch(0.70 0.06 80)"
            strokeWidth={0.6}
          />
          {/* Gema en la torre */}
          <path
            d="M52 14 L55 18 L52 22 L49 18 Z"
            fill="url(#logo-gem)"
          />
          {/* Halo dorado bajo el wordmark */}
          <ellipse
            cx="52"
            cy="30"
            rx="40"
            ry="1.5"
            fill="oklch(0.80 0.12 82 / 0.35)"
          />
        </g>
      </svg>
    </div>
  )
}
