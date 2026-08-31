import { expect, test } from '@playwright/test'

test.describe('Spec 11 — precio real por variante y modal de detalle', () => {
  test('tecleo real de 8 caracteres dispara una sola búsqueda', async ({
    page,
  }) => {
    const searchRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/search')) searchRequests.push(req.url())
    })

    await page.goto('/')
    await page
      .getByTestId('search-input')
      .pressSequentially('sol ring', { delay: 50 })

    // "sol ring" devuelve prints de Sol Ring → esperar a que rendericen.
    await expect(page.getByTestId('print-card').first()).toBeVisible({
      timeout: 30_000,
    })

    // Con debounce ~300ms: 1 request. Sin debounce: ~8 (uno por pulsación).
    expect(searchRequests).toHaveLength(1)
  })

  test('abrir modal desde una fila con stock lista variantes o degrada', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('search-input').fill('Purphoros')

    const card = page.getByTestId('print-card').first()
    await expect(card).toBeVisible({ timeout: 30_000 })

    // La fila con stock es un <button role="row"> (las bloqueadas son <div>).
    const stockRow = card.locator('button[role="row"]').first()
    await expect(stockRow).toBeVisible({ timeout:30_000 })
    await stockRow.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 30_000 })

    // Tolerante: lista de variantes o degradación a imagen + enlace directo.
    // Ambos estados son mutuamente excluyentes: el <ol> de variantes, o el
    // enlace "Ver en <tienda>" (solo cuando no hay variantes útiles).
    await expect(
      dialog
        .getByTestId('offer-variants')
        .or(dialog.getByRole('link', { name: /ver en/i })),
    ).toBeVisible({ timeout: 30_000 })
  })

  test('filas bloqueadas no abren modal ni disparan request', async ({
    page,
  }) => {
    let offerRequests = 0
    page.on('request', (req) => {
      if (req.url().includes('/api/offers')) offerRequests++
    })

    await page.goto('/')
    await page.getByTestId('search-input').fill('Purphoros')

    const card = page.getByTestId('print-card').first()
    await expect(card).toBeVisible({ timeout: 30_000 })

    // "Próximamente" (catlotus, determinista): <div> sin handler.
    const proximamente = card.getByRole('row', { name: /próximamente/i })
    await expect(proximamente).toBeVisible()
    expect(await proximamente.evaluate((el) => el.tagName)).toBe('DIV')
    await proximamente.click({ force: true })
    await page.waitForTimeout(300)
    expect(offerRequests).toBe(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)

    // "Sin stock en <tienda>" (depende del inventario): si existe, igual de bloqueada.
    const sinStock = card.getByRole('row', { name: /sin stock/i })
    if ((await sinStock.count()) > 0) {
      expect(await sinStock.first().evaluate((el) => el.tagName)).toBe('DIV')
      await sinStock.first().click({ force: true })
      await page.waitForTimeout(300)
      expect(offerRequests).toBe(0)
      await expect(page.getByRole('dialog')).toHaveCount(0)
    }
  })
})
