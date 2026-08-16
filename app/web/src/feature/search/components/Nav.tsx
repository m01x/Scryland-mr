/**
 * Nav del header de búsqueda.
 *
 * Presenta los dos botones principales del header ("Home" activo y
 * "Perfil"). En esta spec son display — no navegan ni abren handlers.
 * Las clases activas siguen las guías del mockup (sutil relleno sobre
 * el botón activo, ghost para los demás).
 *
 * Para mantener accesibilidad sin entregar navegación real, cada botón
 * usa `<button type="button" disabled>` para que figure como landmark
 * estructural pero no se vea clickeable.
 */
export default function Nav() {
  return (
    <nav
      aria-label="Principal"
      className="flex items-center gap-2 rounded-full bg-[oklch(0.22_0.03_264/0.55)] p-1 backdrop-blur"
    >
      <button
        type="button"
        disabled
        aria-current="page"
        className="cursor-default rounded-full bg-[oklch(0.27_0.034_264)] px-4 py-1.5 text-sm text-[oklch(0.97_0.006_260)] shadow-[0_0_14px_oklch(0.64_0.20_302/0.35)]"
      >
        Home
      </button>
      <button
        type="button"
        disabled
        className="cursor-default rounded-full px-4 py-1.5 text-sm text-[oklch(0.72_0.02_262)] hover:text-[oklch(0.97_0.006_260)]"
      >
        Perfil
      </button>
    </nav>
  )
}
