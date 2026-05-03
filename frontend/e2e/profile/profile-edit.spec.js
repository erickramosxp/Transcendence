import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	const loginJson = JSON.stringify({
		token: 'e2e-mock-token',
		user: { id: 1, name: 'User E2E', username: 'e2euser', email: 'teste@teste.com' },
	});

	await page.route('**/auth/login', async (route) => {
		if (route.request().method() !== 'POST') return route.continue();
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: loginJson,
		});
	});

	await page.route(
		(url) => url.pathname.includes('/preferences'),
		async (route) => {
			const body =
				route.request().method() === 'GET'
					? JSON.stringify({ language: 'pt', theme: 'light' })
					: '{}';
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body,
			});
		},
	);

	// GET perfil
	await page.route((url) => {
		const p = url.pathname;
		return p === '/user/e2euser' || p === '/api/user/e2euser' || p.endsWith('/user/e2euser');
	}, async (route) => {
		if (route.request().method() !== 'GET') return route.continue();
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				id: 1,
				name: 'User E2E',
				username: 'e2euser',
				bio: 'bio antiga',
			}),
		});
	});

	// UPDATE perfil
	await page.route((url) => {
		const p = url.pathname;
		return p === '/user/profile' || p === '/api/user/profile' || p.endsWith('/user/profile');
	}, async (route) => {
		const method = route.request().method();
		if (method !== 'PUT' && method !== 'PATCH') return route.continue();

		let payload = {};
		try { payload = JSON.parse(route.request().postData() || '{}'); } catch { }

		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				id: 1,
				name: payload.name ?? 'User E2E',
				username: 'e2euser',
				bio: payload.bio ?? 'bio antiga',
			}),
		});
	});
});

test('edita campo simples do perfil', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Email').fill('teste@teste.com');
	await page.getByLabel('Senha').fill('123456');
	await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();
	await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });

	await page.goto('/profile');

	await page.getByRole('button', { name: /Editar perfil|Edit profile|Editar perfil/i }).click();

	const newName = `${'Transcendence'}`;
	await page.getByLabel(/Nome|Name|Nombre/i).fill(newName);

	const saved = page.waitForResponse((r) => {
		const p = new URL(r.url()).pathname;
		const isProfile = p === '/user/profile' || p === '/api/user/profile' || p.endsWith('/user/profile');
		return isProfile && ['PUT', 'PATCH'].includes(r.request().method());
	});

	await page.getByRole('button', { name: /Salvar|Save|Guardar/i }).click();
	await saved;

	await expect(page.getByText(newName)).toBeVisible();
});
