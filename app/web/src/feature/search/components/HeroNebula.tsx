/**
 * Hero nebuloso del header.
 *
 * Capa absoluta detrás del contenido (`-z-10` desde `main`).
 * Combina tres blobs nebulosos (violeta, cian, violeta secundario)
 * que rotan lentamente (60s) sobre un fondo dark nebula. La rotación
 * es puramente decorativa — bajo `prefers-reduced-motion: reduce` se
 * neutraliza vía un media query.
 *
 * Los keyframes viven en este archivo (CSS Module local no aporta con
 * Tailwind v4 — y un `<style>` inline con atributo permite aislar la
 * animación al componente que la necesita).
 */
export default function HeroNebula() {
  return (
    <>
      <style>{`
        @keyframes nebula-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes nebula-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(2rem, -1rem) scale(1.05); }
        }

        .nebula-spin {
          animation: nebula-rotate 60s linear infinite;
          transform-origin: center;
        }

        .nebula-drift {
          animation: nebula-drift 24s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nebula-spin,
          .nebula-drift {
            animation: none !important;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[oklch(0.16_0.026_262)]"
      >
        {/* Violeta grande — izquierda */}
        <div className="absolute -left-48 -top-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.64_0.20_302/0.55),transparent_70%)] blur-3xl nebula-spin" />

        {/* Cian — derecha superior */}
        <div className="absolute -right-32 -top-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.78_0.13_202/0.40),transparent_70%)] blur-3xl nebula-spin" />

        {/* Violeta secundario — centro, drift */}
        <div className="absolute left-1/3 top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.64_0.20_302/0.25),transparent_70%)] blur-3xl nebula-drift" />

        {/* Estrellas — patrón css pseudo-fijo */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 12% 18%, white, transparent), radial-gradient(1px 1px at 22% 72%, white, transparent), radial-gradient(1.2px 1.2px at 38% 30%, white, transparent), radial-gradient(1px 1px at 54% 78%, white, transparent), radial-gradient(0.8px 0.8px at 68% 22%, white, transparent), radial-gradient(1px 1px at 78% 64%, white, transparent), radial-gradient(1.4px 1.4px at 88% 38%, white, transparent), radial-gradient(0.8px 0.8px at 92% 82%, white, transparent)',
          }}
        />

        {/* Cuerpos celestes — esquina superior derecha */}
        <div className="absolute right-10 top-16 flex items-center gap-2 opacity-90">
          <span className="block size-3 rounded-full bg-[oklch(0.80_0.12_82)] shadow-[0_0_14px_oklch(0.80_0.12_82/0.7)]" />
          <span className="block size-7 rounded-full bg-[oklch(0.78_0.13_202/0.55)] shadow-[0_0_28px_oklch(0.78_0.13_202/0.55)]" />
        </div>
      </div>
    </>
  )
}
