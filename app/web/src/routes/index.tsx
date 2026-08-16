import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { HealthResponse } from '@scryland/shared'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch('/api/health')
      return res.json()
    },
  })

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Scryland</h1>

      {isPending ? (
        <p className="text-muted-foreground">Consultando estado de la API…</p>
      ) : isError ? (
        <p className="text-destructive">No se pudo conectar con la API.</p>
      ) : (
        <section className="flex flex-col items-center gap-4">
          <dl className="grid grid-cols-3 gap-6 text-center">
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="text-lg font-medium">{data?.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Uptime</dt>
              <dd className="text-lg font-medium">{data?.uptime}s</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Version</dt>
              <dd className="text-lg font-medium">{data?.version}</dd>
            </div>
          </dl>
          <Button onClick={() => refetch()}>Actualizar</Button>
        </section>
      )}
    </main>
  )
}
