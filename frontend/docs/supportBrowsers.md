## Support for Additional Browsers

### Matriz de suporte de navegador

**Browsers suportados:**  Google Chrome, Microsoft Edge, Mozilla Firefox
**Versões suportadas:** últimas 2 versões estáveis de cada navegador
**Sistema operacional de referência:** Linux (ambiente principal de desenvolvimento e validação)
**Observação de escopo:** Safari não faz parte do escopo obrigatório desta entrega por ausência de ambiente macOS para validação completa.

**Nota:** A validação feita no Chromium é considerada suficiente para cobrir o Microsoft Edge, já que ambos compartilham a mesma engine (Blink).

---

### Estratégia de Validação

- **Automação:** Vitest + Playwright Browser Mode (chromium + firefox)
- **Validação Manual:** smoke test dos fluxos críticos
- **Critério de aprovação:** fluxo funcional + UI/UX consistente entre navegadores suportados

---

### Checklist de regressão funcional (por navegador)

**Legenda:**

- ✅ Passou
- ⚠️ Passou com diferença
- ❌ Falhou
- N/T Não testado


| Fluxo/Feature                                       | Chromium (Chrome/Edge) | Firefox | Observações                                          |
| --------------------------------------------------- | ---------------------- | ------- | ---------------------------------------------------- |
| Login com credenciais                               | ✅                      | ✅       |                                                      |
| Logout                                              | ✅                      | ✅       |                                                      |
| Navegação entre páginas protegidas                  | ✅                      | ✅       |                                                      |
| Carregamento da página de Chat                      | ✅                      | ✅       |                                                      |
| Envio de mensagem no Chat                           | ✅                      | ✅       |                                                      |
| Ordenação de conversas por recência                 | ✅                      | ✅       |                                                      |
| Renderização de mídia em mensagem (img/video/áudio) | ✅                      | ✅       |                                                      |
| Feed: criar post de texto                           | ✅                      | ✅       |                                                      |
| Feed: criar post com foto/vídeo                     | ✅                      | ✅       |                                                      |
| Feed: comentar post                                 | ✅                      | ✅       |                                                      |
| Notificações: carregar página (vazio e listagem)    | ✅                      | ✅       |                                                      |
| Notificações: marcar uma como lida ao abrir destino | ✅                      | ✅       |                                                      |
| Notificações: marcar todas como lidas               | ✅                      | ✅       |                                                      |
| Perfil: editar avatar/imagem                        | ✅                      | ✅       |                                                      |
| Modais principais (abrir/fechar/interações)         | ✅                      | ✅       |                                                      |
| i18n: troca de idioma e textos no Chat              | ✅                      | ✅       |                                                      |
| Responsividade básica (desktop e largura menor)     | ✅                      | ✅       |                                                      |


---

### Resultado dos testes automatizados


#### Testes de componentes (Vitest + Browser Mode)
- Comando executado:
	- `npm run test:storybook`
- Resultado Chromium:
	- 31 arquivos de teste aprovados
	- 128 testes aprovados
- Resultado Firefox:
	- 31 arquivos de teste aprovados
	- 128 testes aprovados


#### Testes E2E (Chromium + Firefox)
- Comando executado:
	- `npm run test:e2e`
- Cenários E2E implementados:

- `auth-login-logout.spec.js`: ✅
  - Valida login com credenciais válidas.
  - Confirma redirecionamento para área autenticada (`/feed`).
  - Valida logout e retorno para rota pública (`/`).

- `route-protection.spec.js`: ✅
  - Tenta acessar rota privada sem autenticação.
  - Confirma redirecionamento automático para rota pública/login.

- `chat-send-message.spec.js`: ✅
  - Acessa a página de chat com usuário autenticado.
  - Seleciona uma conversa existente.
  - Envia mensagem no composer e valida renderização da mensagem na thread.

- `feed-create-post.spec.js`: ✅
  - Acessa o feed autenticado.
  - Abre modal de criação de post de texto.
  - Publica conteúdo e valida exibição do post no feed.

- `feed-comment.spec.js`: ✅
  - Acessa um post no feed.
  - Abre a seção de comentários do post.
  - Envia comentário e valida exibição do novo comentário.

- `profile-edit.spec.js`: ✅
  - Acessa a página de perfil autenticado.
  - Entra no modo de edição de perfil.
  - Atualiza campo de perfil e valida persistência visual da alteração.

- `notifications-page.spec.js`: ✅
  - Acessa a página de notificações autenticado.
  - Valida estado vazio quando não há notificações.
  - Valida listagem de notificações na página.
  - Marca uma notificação como lida ao abrir o destino.
  - Marca todas as notificações como lidas.

- Status geral:
  - Fluxos críticos validados nos dois navegadores suportados para automação. Edge está coberto indiretamente via Chromium.

#### Evidências
- Relatório Playwright (E2E):
  - `frontend/playwright-report/index.html`
- Executar apenas os testes de notificações:
  - `npm run test:e2e -- e2e/notifications/notifications-page.spec.js`

---

### Limitações conhecidas por navegador

- Não foram identificadas limitações funcionais que restrinjam o uso nos diferentes navegadores.

---

### Conclusão de Compatibilidade

- Status geral da compatibilidade (Chrome/Edge/Firefox): **Aprovado**



