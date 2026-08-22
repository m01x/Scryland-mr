import { expect, test } from '@playwright/test'

test.describe('Usabilidad — pantalla de búsqueda', () => {
  test('renderiza la pantalla completa con la fuente Basic y el glow del logo', async ({
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

    // Caja de búsqueda con el query
    await expect(page.getByTestId('search-query')).toHaveText('Sol Ring')
    await expect(page.getByText('Resultado de búsqueda', { exact: true })).toBeVisible()

    // Filtros y contador (4 ediciones)
    await expect(page.getByText('Disponibilidad:')).toBeVisible()
    await expect(page.getByText('Ordenar por:')).toBeVisible()
    await expect(page.getByTestId('editions-count')).toHaveText('4')

    // Grilla con 4 cards de print
    await expect(page.getByTestId('print-card')).toHaveCount(4)

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
})
