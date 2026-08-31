import { expect, test } from '@playwright/test'

test.describe('Usabilidad — pantalla de búsqueda (datos reales)', () => {
  test('renderiza la pantalla base con fuente Basic y estado idle', async ({
    page,
  }) => {
    await page.goto('/')

    // Título de la app
    await expect(page).toHaveTitle('Scryland')

    // Logo presente (glow estático vía drop-shadow)
    const logo = page.locator('img[alt="Scryland"]')
    await expect(logo).toBeVisible()

    // Nav display-only: Home · WatchTower · Perfil
    const nav = page.getByRole('navigation', { name: 'Principal' })
    await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'WatchTower' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Perfil' })).toBeVisible()

    // Input de búsqueda (query vacía) → estado idle observable
    await expect(page.getByTestId('search-input')).toBeVisible()
    await expect(page.getByTestId('search-idle')).toBeVisible()

    // Fuente local "Basic" declarada en body (reemplaza Cinzel/Inter)
    const bodyFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    )
    expect(bodyFont.toLowerCase()).toContain('basic')

    // La fuente local "Basic" realmente carga (no es fallback del sistema)
    const basicLoaded = await page.evaluate(async () => {
      await document.fonts.load('400 16px "Basic"')
      return document.fonts.check('400 16px "Basic"')
    })
    expect(basicLoaded).toBe(true)

    // El glow del logo "respira" al hacer hover (animación logo-breathe)
    await logo.hover()
    const animationOnHover = await logo.evaluate(
      (el) => getComputedStyle(el).animationName,
    )
    expect(animationOnHover).toContain('logo-breathe')
  })

  test('buscar "Sol Ring Fallout" muestra cards separadas con deep-links', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('search-input').fill('Sol Ring Fallout')

    // Prints distintos (un print = una card), no fusionados. El conteo exacto
    // depende del inventario vivo de las tiendas: aserción tolerante.
    await expect(page.getByTestId('print-card').first()).toBeVisible({
      timeout: 30_000,
    })
    const cardCount = await page.getByTestId('print-card').count()
    expect(cardCount).toBeGreaterThanOrEqual(2)
    await expect(page.getByTestId('editions-count')).toHaveText(String(cardCount))

    // Deep-link real a /products/... (CTA "Ver mejor precio" de una card con stock).
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible()
  })

  test('buscar "Purphoros" muestra ofertas de INEKO y Paytowin con "desde"', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('search-input').fill('Purphoros')

    await expect(page.getByTestId('print-card').first()).toBeVisible({
      timeout: 30_000,
    })

    // Ofertas reales de las dos tiendas objetivo
    await expect(page.getByText('INEKO').first()).toBeVisible()
    await expect(page.getByText('Paytowin').first()).toBeVisible()

    // Precio rotulado "desde $X" (el price es el mínimo entre variantes)
    await expect(page.getByText('desde', { exact: false }).first()).toBeVisible()
  })

  test('búsqueda sin resultados muestra estado vacío', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('search-input').fill('zzzzqqqqwwww')

    await expect(page.getByTestId('search-empty')).toBeVisible({
      timeout: 30_000,
    })
  })
})
