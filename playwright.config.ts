import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Diretório dos testes
    testDir: './e2e',

    // Timeout por teste
    timeout: 30 * 1000,

    // Expect timeout
    expect: {
        timeout: 5000,
    },

    // Rodar testes em paralelo
    fullyParallel: true,

    // Falhar o build no CI se tiver test.only
    forbidOnly: !!process.env.CI,

    // Retry apenas no CI
    retries: process.env.CI ? 2 : 0,

    // Reporters
    reporter: process.env.CI ? 'github' : 'list',

    // Configurações globais
    use: {
        // Base URL do app
        baseURL: 'http://localhost:3000',

        // Coletar trace em falhas
        trace: 'on-first-retry',

        // Screenshots em falha
        screenshot: 'only-on-failure',
    },

    // Projetos (browsers)
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Web server - iniciar o app antes dos testes
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
})
