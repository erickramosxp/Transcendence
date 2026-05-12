import { test, expect } from '@playwright/test';

const emptyFeedJson = JSON.stringify({
	page: 0,
	hasMore: false,
	items: [],
});

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
		(url) => url.pathname.endsWith('/posts') && url.searchParams.has('page'),
		async (route) => {
			if (route.request().method() !== 'GET') {
				await route.continue();
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: emptyFeedJson,
			});
		},
	);

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
	await expect(page.getByTestId('auth-login-submit')).toBeVisible();

	await page.getByTestId('auth-login-email').fill('teste@teste.com');
	await page.getByTestId('auth-login-password').fill('123456');

	await page.getByTestId('auth-login-submit').click();

	await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });
	await expect(page.getByTestId('auth-logout')).toBeVisible();

	await page.getByTestId('auth-logout').click();

	await expect(page).toHaveURL('/');
	await expect(page.getByTestId('auth-login-submit')).toBeVisible();
});
