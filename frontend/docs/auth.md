# Domínio: Auth (Autenticação e Segurança)

O módulo de **Auth** gerencia toda a segurança em nível de cliente: captura de credenciais, integração com o Google Sign-In SDK, persistência de tokens JWT e a proteção física de rotas privadas contra acessos não-autorizados.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/auth/`
- **Páginas de Rota**: `src/pages/Home.jsx` (ponto de entrada/login/registro)

---

## 2. Fluxos de Autenticação Suportados

### A. Autenticação Local (E-mail/Senha)
- **Registro**: O formulário de cadastro valida em tempo real os campos usando restrições de tamanho (e-mail, nome, username de 3-30 caracteres, e senha de 8-30 caracteres). Dispara chamada para `POST /auth/register`.
- **Login**: O formulário aceita tanto o e-mail quanto o username diretamente no mesmo campo, enviando para `POST /auth/login`.

### B. Autenticação Social (Google OAuth2)
Integrado usando a biblioteca `@react-oauth/google` baseada na nova Google Identity Services API.
1. O usuário clica em "Entrar com Google".
2. O SDK do Google abre o modal nativo de login seguro.
3. Após o login bem-sucedido no Google, um **código de autorização (Auth Code)** é devolvido ao frontend.
4. O frontend envia esse código para o backend em `POST /auth/google`.
5. O backend responde com o token JWT e os dados de perfil da mesma forma que o login local.

---

## 3. Gerenciamento de Estado de Autenticação (`AuthProvider`)

A sessão do usuário é gerenciada e distribuída na árvore de componentes através do **React Context** (`AuthProvider` e o hook `useAuth()`), localizado em [`AuthProvider.jsx`](file:///\\wsl.localhost\Ubuntu\home\erramos\antigravit\frontend\src\app\providers\AuthProvider.jsx):

- **Propriedades expostas**:
  - `user`: Dados do usuário logado (ID, nome, username, avatar).
  - `isAuthenticated`: Flag booleana reativa indicando o estado de login.
  - `loading`: Flag indicando se a sessão está sendo carregada/verificada.
- **Persistência Segura**:
  - O token JWT e os dados do usuário são persistidos no **`localStorage`** do navegador sob as chaves **`@trascendence:token`** e **`@trascendence:user`** (nota: grafia sem a letra "n" no prefixo `trascendence`). Isso garante que a sessão do usuário permaneça ativa mesmo se ele recarregar a página (F5) ou fechar o browser.
- **Ações**:
  - `login(credentials)`: Autentica o usuário localmente, salva o token e dados no `localStorage`, carrega as preferências de usuário e redireciona para `/feed`.
  - `register(infoUserRegister)`: Registra um novo usuário e realiza o login automático de forma idêntica ao fluxo local.
  - `logout()`: Limpa o estado da sessão, remove o token e usuário do `localStorage` e redireciona o usuário de volta para a página inicial (`/`).

---

## 4. Proteção de Rotas (`PrivateRoute`)

A segurança de acesso a telas privadas (como `/feed`, `/chat` ou `/profile`) é garantida pelo componente **`PrivateRoute`** localizado em [`PrivateRoute.jsx`](file:///\\wsl.localhost\Ubuntu\home\erramos\antigravit\frontend\src\app\routes\PrivateRoute.jsx):

```jsx
// Comportamento simplificado
export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
```

Qualquer tentativa de acessar telas privadas sem uma sessão ativa redireciona o browser imediatamente para a página inicial `/` de forma limpa.

---

## 5. Validação de Sessão ativa no Startup

Quando a aplicação é carregada pela primeira vez, o frontend realiza uma verificação inicial de consistência de sessão:
1. Durante a montagem do `AuthProvider` (`useEffect`), o frontend verifica a presença de `@trascendence:token` e `@trascendence:user` no `localStorage`.
2. Se ambos existirem, o estado `isAuthenticated` é definido como `true` e os dados do usuário são carregados na aplicação, continuando a navegação protegida de forma instantânea.
3. Se o token for considerado inválido ou expirar durante chamadas HTTP subsequentes no backend, os interceptores globais do Axios capturam o erro `401 Unauthorized`, limpam o `localStorage` e redirecionam o usuário de volta à tela inicial.
