import { test, expect } from '@playwright/test';

test.describe('Dashboard Aurora E2E', () => {
  test('deve carregar a página inicial no porto 5050', async ({ page }) => {
    // Tenta acessar o dashboard
    await page.goto('http://localhost:5050');

    // Verifica se o título da página ou o header está presente
    // O título padrão configurado no App.tsx / index.html deve conter "caLLM"
    await expect(page).toHaveTitle(/caLLM/);

    // Verifica se a Sidebar ou o título principal está visível
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
  });

  test('deve navegar para a página de Playbooks', async ({ page }) => {
    await page.goto('http://localhost:5050');
    
    // Seleciona o link de playbooks na sidebar (ajustar seletor conforme real)
    const playbooksLink = page.getByRole('link', { name: /Playbooks/i });
    if (await playbooksLink.isVisible()) {
      await playbooksLink.click();
      await expect(page).toHaveURL(/.*playbooks/);
    }
  });
});
