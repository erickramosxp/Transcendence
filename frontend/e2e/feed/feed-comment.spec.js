import { test, expect } from '@playwright/test';

const POST_ID = 1001;

test.beforeEach(async ({ page }) => {
  const loginJson = JSON.stringify({
    token: 'e2e-mock-token',
    user: { id: 1, name: 'User E2E', email: 'teste@teste.com' },
  });

  await page.route('**/auth/login', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({ status: 200, contentType: 'application/json', body: loginJson });
  });

  await page.route((url) => url.pathname.includes('/preferences'), async (route) => {
    const body =
      route.request().method() === 'GET'
        ? JSON.stringify({ language: 'pt', theme: 'light' })
        : '{}';
    await route.fulfill({ status: 200, contentType: 'application/json', body });
  });

  await page.route((url) => url.pathname.includes('/friendships/online'), async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.route((url) => {
    const p = url.pathname;
    return p === '/posts' || p === '/api/posts' || p.endsWith('/posts');
  }, async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: POST_ID,
          name: 'User E2E',
          username: 'e2euser',
          contents: 'Post seed E2E',
          avatarUrl: null,
          likedByMe: false,
          likeCount: 0,
          commentCount: 0,
          media: null,
          created_at: new Date().toISOString(),
        }],
        page: 0,
        size: 1,
        hasMore: false,
      }),
    });
  });

  await page.route((url) => /\/(api\/)?comment\/\d+$/.test(url.pathname), async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.route((url) => /\/(api\/)?comment$/.test(url.pathname), async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    let text = '';
    try { text = JSON.parse(route.request().postData() || '{}').text ?? ''; } catch {}
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: Date.now(),
        postId: POST_ID,
        name: 'User E2E',
        username: 'e2euser',
        contents: text,
        avatarUrl: null,
        likedByMe: false,
        likeCount: 0,
        created_at: new Date().toISOString(),
      }),
    });
  });
});

test('comenta em um post no feed', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('teste@teste.com');
  await page.getByLabel('Senha').fill('123456');
  await page.getByRole('button', { name: /Entrar|Login|Iniciar sesi[oó]n/i }).click();
  await expect(page).toHaveURL(/\/feed$/, { timeout: 15_000 });

  const postCard = page.getByTestId('post-card').filter({
    has: page.getByText('Post seed E2E', { exact: true }),
  });
  
  await expect(postCard).toBeVisible();

  await postCard.locator('button:has(svg.lucide-message-square)').click();
  await expect(postCard.getByText(/Sem comentários|No comments yet|Sin comentarios/i)).toBeVisible();

  const commentText = `e2e-comment-${Date.now()}`;
  await postCard.getByPlaceholder(/Escreva um comentário|Write a comment|Escribe un comentario/i).fill(commentText);

  const commentSaved = page.waitForResponse((r) => {
    if (r.request().method() !== 'POST') return false;
    const p = new URL(r.url()).pathname;
    return p === '/comment' || p === '/api/comment' || p.endsWith('/comment');
  });

  await postCard.locator('form button[type="submit"]').click();
  await commentSaved;
  await expect(postCard.getByText(commentText, { exact: true })).toBeVisible();
});
