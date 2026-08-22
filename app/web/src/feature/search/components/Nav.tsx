import { Button } from '@/components/ui/button'

/**
 * Nav del header de búsqueda.
 *
 * Tres entradas display-only (`Home`, `WatchTower`, `Perfil`) construidas
 * con `Button` de shadcn. No navegan ni abren handlers: esta spec no
 * define rutas de destino, así que se renderizan deshabilitadas para que
 * figuren como landmarks estructurales sin parecer clickeables.
 *
 * "Home" es la entrada activa (`aria-current="page"`) y se resalta con la
 * variante `secondary` + un halo violeta sutil; el resto usa `ghost`.
 */
export default function Nav() {
  return (
    <nav
      aria-label="Principal"
      className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur"
    >
      <Button
        type="button"
        variant="secondary"
        disabled
        aria-current="page"
        className="rounded-full shadow-[0_0_14px_oklch(0.64_0.20_302/0.35)] disabled:opacity-100"
      >
        Home
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled
        className="rounded-full text-muted-foreground disabled:opacity-100"
      >
        WatchTower
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled
        className="rounded-full text-muted-foreground disabled:opacity-100"
      >
        Perfil
      </Button>
    </nav>
  )
}
