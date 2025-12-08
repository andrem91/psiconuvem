import { test, expect } from '@playwright/test'

/**
 * Testes E2E para módulo de pacientes.
 * Nota: Estes testes requerem um usuário autenticado.
 * Para rodar, configure o estado de autenticação ou use bypass de auth em dev.
 */

test.describe('Pacientes - Página pública', () => {
    test('deve redirecionar para login quando não autenticado', async ({ page }) => {
        await page.goto('/dashboard/pacientes')

        // Deve redirecionar para login
        await expect(page).toHaveURL(/.*login|.*auth/)
    })
})

test.describe('Formulário de paciente', () => {
    test.skip('deve validar campos obrigatórios', async ({ page }) => {
        // Este teste requer autenticação
        // Skipped até configuração de auth fixture

        await page.goto('/dashboard/pacientes/novo')

        // Submeter formulário vazio
        await page.click('button[type="submit"]')

        // Deve mostrar erros de validação
        await expect(page.locator('text=obrigatório')).toBeVisible()
    })

    test.skip('deve aceitar dados válidos', async ({ page }) => {
        // Este teste requer autenticação
        // Skipped até configuração de auth fixture

        await page.goto('/dashboard/pacientes/novo')

        // Preencher formulário
        await page.fill('input[name="name"]', 'Teste Playwright')
        await page.fill('input[name="phone"]', '11999998888')
        await page.fill('input[name="email"]', 'teste@playwright.com')

        // Submeter
        await page.click('button[type="submit"]')

        // Deve redirecionar para lista
        await expect(page).toHaveURL(/.*pacientes/)
    })
})

test.describe('Schema de validação (frontend)', () => {
    test('deve mostrar página de novo paciente ou redirecionar', async ({ page }) => {
        const response = await page.goto('/dashboard/pacientes/novo')

        // Deve ou mostrar a página (200) ou redirecionar (302)
        expect([200, 302, 307]).toContain(response?.status() ?? 0)
    })
})
