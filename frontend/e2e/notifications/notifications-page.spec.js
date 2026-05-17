import { test, expect } from '@playwright/test';

const NOTIF_UNREAD_ID = 1;
const NOTIF_READ_ID = 2;

function isNotificationsListUrl(url) {
	const p = url.pathname;
	return p === '/api/notifications' || p.endsWith('/api/notifications');
}

function isUnreadCountUrl(url) {
	return /\/api\/notifications\/unread-count$/.test(url.pathname);
}

function isMarkOneReadUrl(url) {
	return /\/api\/notifications\/\d+\/read$/.test(url.pathname);
}

function isMarkAllReadUrl(url) {
	return /\/api\/notifications\/read-all$/.test(url.pathname);
}

function buildNotification(overrides = {}) {
	return {
		id: NOTIF_UNREAD_ID,
		type: 'FRIEND_REQUEST',
		isRead: false,
		name: 'Alice E2E',
		username: 'alicee2e',
		avatarUrl: null,
		preview: '',
		chatName: '',
		postId: null,
		commentId: null,
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

async function login(page) {
	await page.goto('/');
	await page.getByLabel('Email').fill('teste@teste.com');
	await page.getByLabel('Senha').fill('123456');
	await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();
	await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });
}

test.describe('página de notificações', () => {
	test.beforeEach(async ({ page }) => {
		const loginJson = JSON.stringify({
			token: 'e2e-mock-token',
			user: { id: 1, name: 'User E2E', email: 'teste@teste.com' },
		});

		let notifications = [];
		let unreadCount = 0;

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

		const emptyFeed = JSON.stringify({
			items: [],
			page: 0,
			size: 0,
			hasMore: false,
		});

		await page.route(
			(url) => {
				const p = url.pathname;
				if (/\/posts\/\d/.test(p)) return false;
				return p === '/posts' || p === '/api/posts' || p.endsWith('/posts');
			},
			async (route) => {
				if (route.request().method() !== 'GET') return route.continue();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: emptyFeed,
				});
			},
		);

		await page.route(
			(url) => isNotificationsListUrl(url),
			async (route) => {
				if (route.request().method() !== 'GET') return route.continue();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						items: notifications,
						page: 0,
						size: 20,
						hasMore: false,
					}),
				});
			},
		);

		await page.route(
			(url) => isUnreadCountUrl(url),
			async (route) => {
				if (route.request().method() !== 'GET') return route.continue();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ count: unreadCount }),
				});
			},
		);

		await page.route(
			(url) => isMarkOneReadUrl(url),
			async (route) => {
				if (route.request().method() !== 'PATCH') return route.continue();
				const id = Number(
					new URL(route.request().url()).pathname.match(
						/\/api\/notifications\/(\d+)\/read/,
					)?.[1],
				);
				notifications = notifications.map((n) =>
					n.id === id ? { ...n, isRead: true } : n,
				);
				unreadCount = notifications.filter((n) => n.isRead === false).length;
				await route.fulfill({ status: 204, body: '' });
			},
		);

		await page.route(
			(url) => isMarkAllReadUrl(url),
			async (route) => {
				if (route.request().method() !== 'PATCH') return route.continue();
				notifications = notifications.map((n) => ({ ...n, isRead: true }));
				unreadCount = 0;
				await route.fulfill({ status: 204, body: '' });
			},
		);

		page.__e2eNotifications = {
			setList(items) {
				notifications = items;
				unreadCount = items.filter((n) => n.isRead === false).length;
			},
			getList: () => notifications,
		};
	});

	test('exibe estado vazio quando não há notificações', async ({ page }) => {
		page.__e2eNotifications.setList([]);

		await login(page);
		await page.goto('/notifications');

		await expect(
			page.getByRole('heading', { level: 1, name: /^Notificações$/i }),
		).toBeVisible();
		await expect(
			page.getByText(/Nenhuma notificação por aqui/i),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: /Marcar todas como lidas/i }),
		).toBeDisabled();
	});

	test('lista notificações na página', async ({ page }) => {
		page.__e2eNotifications.setList([
			buildNotification({
				id: NOTIF_UNREAD_ID,
				type: 'FRIEND_REQUEST',
				isRead: false,
				name: 'Alice E2E',
			}),
			buildNotification({
				id: NOTIF_READ_ID,
				type: 'LIKE_POST',
				isRead: true,
				name: 'Bob E2E',
				postId: 42,
			}),
		]);

		await login(page);
		await page.goto('/notifications');

		await expect(
			page.getByText(/Alice E2E.*solicitação de amizade/i),
		).toBeVisible();
		await expect(
			page.getByText(/Bob E2E.*curtiu seu post/i),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: /Marcar todas como lidas/i }),
		).toBeEnabled();
	});

	test('marca uma notificação como lida ao abrir o destino', async ({ page }) => {
		page.__e2eNotifications.setList([
			buildNotification({
				id: NOTIF_UNREAD_ID,
				type: 'FRIEND_REQUEST',
				isRead: false,
				name: 'Alice E2E',
			}),
		]);

		await login(page);
		await page.goto('/notifications');

		const markReadResponse = page.waitForResponse(
			(r) =>
				r.request().method() === 'PATCH' && isMarkOneReadUrl(new URL(r.url())),
			{ timeout: 15_000 },
		);

		await page
			.getByRole('button', { name: /Abrir destino da notificação/i })
			.first()
			.click();

		await markReadResponse;
		await expect(page).toHaveURL(/\/friends/, { timeout: 15_000 });
	});

	test('marca todas as notificações como lidas', async ({ page }) => {
		page.__e2eNotifications.setList([
			buildNotification({
				id: NOTIF_UNREAD_ID,
				type: 'FRIEND_REQUEST',
				isRead: false,
				name: 'Alice E2E',
			}),
			buildNotification({
				id: NOTIF_READ_ID,
				type: 'LIKE_POST',
				isRead: false,
				name: 'Bob E2E',
				postId: 42,
			}),
		]);

		await login(page);
		await page.goto('/notifications');

		const markAllResponse = page.waitForResponse(
			(r) =>
				r.request().method() === 'PATCH' && isMarkAllReadUrl(new URL(r.url())),
			{ timeout: 15_000 },
		);

		await page
			.getByRole('button', { name: /Marcar todas como lidas/i })
			.click();

		await markAllResponse;

		await expect(
			page.getByRole('button', { name: /Marcar todas como lidas/i }),
		).toBeDisabled();

		const unreadDots = page.locator('article span.rounded-full.bg-primary');
		await expect(unreadDots).toHaveCount(0);
	});
});
