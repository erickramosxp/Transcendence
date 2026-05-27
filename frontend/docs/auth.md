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

## 3. Gerenciamento de Estado de Autenticação (`useAuthStore`)
O Zustand gerencia de forma reativa o ciclo de sessão do usuário:

- **Propriedades**:
  - `user`: Dados do usuário logado (ID, nome, username, avatar).
  - `token`: String do token JWT ativo.
  - `isAuthenticated`: Flag booleana reativa rápida.
- **Persistência Segura**:
  - O estado da store é persistido no **`localStorage`** do navegador. Isso garante que a sessão do usuário permaneça ativa mesmo se ele recarregar a página (F5) ou fechar o browser.
- **Ações**:
  - `login(userData, jwtToken)`: Salva os dados no estado e atualiza os headers padrão do Axios.
  - `logout()`: Limpa o estado, remove o JWT do `localStorage` e desconecta as conexões ativas do WebSocket de tempo real.

---

## 4. Proteção de Rotas (`ProtectedRoute`)
A segurança de acesso a telas privadas (como `/feed`, `/chat` ou `/profile`) é garantida pelo componente `ProtectedRoute` localizado em `src/features/auth/components/ProtectedRoute.jsx`:

```jsx
// Comportamento simplificado
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
```

Qualquer tentativa de acessar telas privadas sem um token válido redireciona o browser imediatamente para a página inicial `/` de forma limpa.

---

## 5. Validação de Sessão ativa no Startup
Quando a aplicação é carregada pela primeira vez, o frontend realiza uma verificação inicial de consistência de sessão:
1. Se houver um token JWT persistido no `localStorage`, o frontend dispara de forma assíncrona uma chamada HTTP ao endpoint `/me`.
2. Se a chamada for bem-sucedida (status `200 OK`), os dados do usuário são atualizados na store e a sessão continua ativa.
3. Se a chamada falhar (token expirado ou removido no backend), o interceptor de erros captura o erro `401 Unauthorized`, limpa a store automaticamente e garante que o usuário seja devolvido à tela pública com segurança.
