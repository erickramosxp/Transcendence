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

  await page.route(
    (url) => url.pathname.includes('/friendships/online'),
    async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    },
  );

  const emptyFeed = JSON.stringify({
    items: [],
    page: 0,
    size: 0,
    hasMore: false,
  });

  async function readPostTextFromRequest(route) {
    const req = route.request();
    try {
      const fd = await req.formData();
      const v = fd.get('text');
      if (v != null && String(v).length > 0) return String(v);
    } catch {
      /* continuar */
    }
    const raw = req.postData();
    if (typeof raw === 'string' && raw.includes('name="text"')) {
      let m = raw.match(
        /Content-Disposition:\s*form-data;\s*name="text"\s*\r?\n\r?\n([\s\S]*?)(?:\r?\n--|$)/i,
      );
      if (!m) m = raw.match(/name="text"\r?\n\r?\n([\s\S]*?)(?:\r?\n--|$)/);
      if (m?.[1]) return m[1].trim();
    }
    try {
      return JSON.parse(req.postData() || '{}').text ?? '';
    } catch {
      return '';
    }
  }

  const isPostsCollection = (url) => {
    const p = url.pathname;
    if (/\/posts\/\d/.test(p)) return false;
    return p === '/posts' || p === '/api/posts' || p.endsWith('/posts');
  };

  await page.route(isPostsCollection, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: emptyFeed,
      });
      return;
    }
    if (method === 'POST') {
      const texto = await readPostTextFromRequest(route);
      const body = JSON.stringify({
        id: Date.now(),
        name: 'User E2E',
        username: 'e2euser',
        contents: texto,
        avatarUrl: null,
        likedByMe: false,
        likeCount: 0,
        commentCount: 0,
        media: null,
        created_at: new Date().toISOString(),
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
      return;
    }
    await route.continue();
  });
});

test('cria post de texto no feed', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Email').fill('teste@teste.com');
  await page.getByLabel('Senha').fill('123456');
  await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();
  await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });

  await expect(page.getByText(/Nada por aqui ainda|Nothing here yet/i)).toBeVisible();

  await page.locator('.feed-grid').getByRole('button').first().click();

  const dialog = page.getByRole('dialog').filter({
    has: page.getByRole('heading', {
      level: 2,
      name: /Criar publicação|Create post|Crear publicación/i,
    }),
  });
  await expect(dialog).toBeVisible();

  const msg = `e2e-feed-${Date.now()}`;
  await dialog
    .getByPlaceholder(/pensando|thinking|estás pensando/i)
    .fill(msg);

  const postSaved = page.waitForResponse(
    (r) => {
      if (r.request().method() !== 'POST') return false;
      const p = new URL(r.url()).pathname;
      if (/\/posts\/\d/.test(p)) return false;
      return p === '/posts' || p === '/api/posts' || p.endsWith('/posts');
    },
    { timeout: 15_000 },
  );
  await dialog.getByRole('button', { name: /Postar|Post|Publicar/i }).click();
  await postSaved;

  await expect(page.locator('.feed-grid').getByText(msg, { exact: true })).toBeVisible();
});
