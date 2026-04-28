import { test, expect } from '@playwright/test';

const CHAT_ID = 99;

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

  const listBody = JSON.stringify({
    items: [
      {
        id: CHAT_ID,
        type: 'direct',
        chatName: null,
        user: { id: 2, name: 'Peer E2E', username: 'peere2e' },
        lastMessage: { text: 'Olá', createdAt: new Date().toISOString() },
      },
    ],
    page: 0,
    size: 1,
    hasMore: false,
  });

  const emptyMessages = JSON.stringify({
    items: [],
    page: 0,
    size: 0,
    hasMore: false,
  });

  await page.route(
    (url) => url.pathname.includes(`/chats/${CHAT_ID}/messages`),
    async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: emptyMessages,
      });
      return;
    }
    if (method === 'POST') {
      let text = '';
      try {
        text = JSON.parse(route.request().postData() || '{}').text ?? '';
      } catch {
        text = '';
      }
      const created = {
        id: Date.now(),
        chatId: CHAT_ID,
        senderId: 1,
        user: { id: 1, name: 'User E2E', username: 'e2e', avatarUrl: null },
        text,
        createdAt: new Date().toISOString(),
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }
    await route.continue();
  });

  await page.route(
    (url) => {
      const p = url.pathname;
      if (p.includes('/messages')) return false;
      return p === '/chats' || p === '/api/chats' || p.endsWith('/chats');
    },
    async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: listBody,
      });
    },
  );
});

test('envia mensagem no chat', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('teste@teste.com');
  await page.getByLabel('Senha').fill('123456');
  await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();
  await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });

  await page.goto('/chat');
  await expect(
    page.getByRole('heading', { level: 2, name: /^(Mensagens|Messages)$/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: /Peer E2E/i }).click();

  const msg = `e2e-${Date.now()}`;
  await page.locator('.ds-chat-input-field').fill(msg);
  await page.locator('form.ds-chat-input-form button[type="submit"]').click();

  await expect(
    page.locator('.ds-chat-thread-scroll').getByText(msg, { exact: true }),
  ).toBeVisible();
});
