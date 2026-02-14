

# Autenticação (Frontend)

Este módulo é responsável por toda a lógica de autenticação no frontend (login, logout, persistência de sessão e proteção de rotas). 

Atualmente a autenticação está **mockada**, mas a arquitetura já está pronta para integração com o backend. 

---  

## 📦 Estrutura

```bash
features/auth
├── components
│ └── AuthContainer.jsx # Formulário de login (mockado)
├── services
│ └── authService.js # Onde ficará a comunicação com a API
└── README.md
```

Além disso, a lógica global de autenticação fica em: 

```bash
app/providers/AuthProvider.jsx
```

 ---  

## 🔐 Como a autenticação funciona hoje (mock)

- O login é simulado no frontend 

- Ao clicar em "Entrar":  
  
  - Um usuário fake é criado  
  
  - Um token fake é salvo no `localStorage` 

- As rotas privadas verificam apenas se existe token salvo 
  
  

Chaves usadas no `localStorage`:

- `@trascendence:token` 
- `@trascendence:user` 



--- 

## 🔌 Como integrar com o backend (quando estiver pronto)

### 1️⃣ Criar a chamada de login na API

 No arquivo:

```js
features/auth/services/authService.js
```

Exemplo:

```js
import { api } from "@/shared/services/api";

export async function loginRequest(email, password) {

    const response = await api.post("/auth/login", {
        email,
        password, 
    }); 
    
    return response.data; 
}
```

O backend deve retornar algo como:

```json
{
    "token": "jwt-token",
    "user": {
        "id": 1,
        "name": "Nome",
        "email": "email@teste.com"
    }
}
```

---

### 2️⃣ Usar o backend no AuthProvider

No `AuthProvider.jsx`, substituir o login mockado por:

```js
const login = async (email, password) => {
       const { token, user } = await loginRequest(email, password);

        localStorage.setItem("@trascendence:token", token);
        localStorage.setItem("@trascendence:user", JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);
};
```

---

### 3️⃣ Enviar token automaticamente nas requisições

No arquivo de configuração da API (`api.js`):

```js
api.interceptors.request.use((config) => {
    
    const token = localStorage.getItem("@trascendence:token");
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;

});
```

Assim, **todas as requisições autenticadas funcionam automaticamente**.

---

### 4️⃣ Token expirado / logout automático

Se o backend retornar `401 Unauthorized`:

```js
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("@trascendence:token");
            localStorage.removeItem("@trascendence:user");

            window.location.href = "/"; 
        }
    
        return Promise.reject(error);
    }
);
```

---

## 🚪 Logout

O logout no frontend deve:

- Remover token e usuário do `localStorage`

- Resetar estado do `AuthProvider`

- Redirecionar para `/`

```js
const logout = () => {
    localStorage.removeItem("@trascendence:token");
    localStorage.removeItem("@trascendence:user");

    setUser(null);
    setIsAuthenticated(false);
};
```

---

## 🔒 Proteção de rotas

- Rotas privadas usam `PrivateRoute`

- Se não houver token → redireciona para `/`

- Se estiver autenticado → acesso liberado

Isso garante:

- Proteção por URL direta

- Persistência de sessão após reload

- Redirecionamento correto entre rotas públicas e privadas

---

## ✅ Resumo

- Toda a estrutura já está pronta para o backend

- Basta:
  
  1. Conectar o endpoint real de login
  
  2. Retornar `token + user`
  
  3. Manter o contrato esperado pelo frontend
