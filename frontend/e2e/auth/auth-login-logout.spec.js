import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
	const loginJson = JSON.stringify({
		token: 'e2e-mock-token',
		user: { id: 1, name: 'User E2E', email: 'teste@teste.com' },
	});

	await page.route('**/auth/login', async (route) => {
		if (route.request().method() !== 'POST') {
			await route.continue();
			return;
		}
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: loginJson,
		});
	});

	await page.route(
		(url) => url.pathname.includes('/preferences'),
		async (route) => {
			const method = route.request().method();
			const body =
				method === 'GET'
					? JSON.stringify({ language: 'pt', theme: 'light' })
					: '{}';
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body,
			});
		},
	);
});

test('Login e Logout com sucesso', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveURL('/');
	await expect(
		page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }),
	).toBeVisible();

	await page.getByLabel('Email').fill('teste@teste.com');
	await page.getByLabel('Senha').fill('123456');

	await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();

	await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });
	await expect(
		page.getByRole('button', { name: /Sair|Logout|Cerrar sesión/i }),
	).toBeVisible();

	await page.getByRole('button', { name: /Sair|Logout|Cerrar sesión/i }).click();

	await expect(page).toHaveURL('/');
	await expect(
		page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }),
	).toBeVisible();
});
