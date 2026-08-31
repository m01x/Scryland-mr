import { useEffect, useState } from 'react'

/**
 * Devuelve `value` recién cuando pasan `delayMs` sin cambios.
 *
 * Paso 1 de la mitigación de fan-out: el input sigue atado al estado
 * inmediato, pero el `useQuery` de búsqueda consume este valor
 * debounceado, de modo que un tecleo real dispara una sola request.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(value)
    }, delayMs)

    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
