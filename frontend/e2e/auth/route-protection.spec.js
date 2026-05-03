import { test, expect } from '@playwright/test';


test('Rota privada redireciona para login quando deslogado', async ({ page }) => {
	await page.goto('/feed');
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i })).toBeVisible();
});
