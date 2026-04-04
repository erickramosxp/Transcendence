# Guia de i18n — Organização, Uso e Convenções

Este documento descreve como o sistema de internacionalização (i18n) está organizado no projeto Transcendence, como adicionar novas traduções e como utilizá-lo corretamente em componentes React.

---

## Visão Geral

O projeto usa **`i18next`** com o binding **`react-i18next`** para gerenciar traduções. As strings estão organizadas em **namespaces** (arquivos JSON separados por feature) dentro de pastas por idioma.

**Idiomas suportados:**

| Código | Idioma | Bandeira |
|--------|--------|---------|
| `pt` | Português | 🇧🇷 |
| `en` | English | 🇺🇸 |
| `es` | Español | 🇪🇸 |

---

## Estrutura de Arquivos

```
frontend/src/i18n/
├── index.js                    ← Configuração e inicialização do i18next
├── locales/
│   ├── pt/                     ← Traduções em Português (idioma base)
│   │   ├── auth.json
│   │   ├── authProvider.json
│   │   ├── feed.json
│   │   ├── profile.json
│   │   ├── home.json
│   │   ├── chat.json
│   │   └── common.json
│   ├── en/                     ← Traduções em Inglês
│   │   └── (mesmos arquivos)
│   └── es/                     ← Traduções em Espanhol
│       └── (mesmos arquivos)
```

### Namespaces e suas responsabilidades

| Namespace | Arquivo | Usado em |
|-----------|---------|----------|
| `auth` | `auth.json` | Formulários de login, cadastro e social login |
| `authProvider` | `authProvider.json` | Toasts e mensagens do `AuthProvider` |
| `feed` | `feed.json` | Feed, criação de posts, comentários, popup |
| `profile` | `profile.json` | Perfil, edição de perfil, tabs |
| `home` | `home.json` | Landing page / home pública |
| `chat` | `chat.json` | Feature de chat (a ser preenchido) |
| `common` | `common.json` | Strings reutilizadas entre features |

---

## Configuração (`src/i18n/index.js`)

O arquivo `index.js` inicializa o i18next com os idiomas e namespaces disponíveis, carrega as traduções e define o idioma padrão lido do `localStorage`.

```js
// Exemplo simplificado do que acontece no index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa todos os arquivos JSON de tradução
import ptAuth from './locales/pt/auth.json';
import enAuth from './locales/en/auth.json';
// ... outros namespaces

i18n.use(initReactI18next).init({
  resources: {
    pt: { auth: ptAuth, feed: ptFeed, /* ... */ },
    en: { auth: enAuth, feed: enFeed, /* ... */ },
    es: { auth: esAuth, feed: esFeed, /* ... */ },
  },
  lng: localStorage.getItem('language') || 'pt', // idioma inicial
  fallbackLng: 'pt',                             // fallback se chave não existir
  interpolation: { escapeValue: false },
});
```

---

## Como usar em componentes

### 1. Importar o hook `useTranslation`

```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Inicializar com o namespace correto

Cada componente declara de qual namespace vai ler as traduções:

```jsx
function LoginForm() {
  const { t } = useTranslation('auth'); // namespace = 'auth'
  // ...
}
```

### 3. Usar a função `t()` para traduzir strings

A função `t` recebe o **caminho da chave** dentro do JSON do namespace (separado por ponto `.`):

```jsx
// auth.json:
// {
//   "login": {
//     "title": "Bem-vindo de volta!",
//     "email": "Email"
//   }
// }

<h2>{t('login.title')}</h2>      // → "Bem-vindo de volta!" (em PT)
<label>{t('login.email')}</label> // → "Email"
```

---

## Estrutura dos arquivos JSON

Os arquivos de tradução são objetos JSON com chaves aninhadas. O caminho até a string é escrito com `.` na função `t()`.

### Exemplo: `auth.json`

```json
{
  "tabs": {
    "login": "Entrar",
    "register": "Cadastrar"
  },
  "login": {
    "title": "Bem-vindo de volta!",
    "subtitle": "Entre na sua conta para continuar.",
    "email": "Email",
    "emailPlaceholder": "Digite seu email",
    "password": "Senha",
    "passwordPlaceholder": "Digite sua senha",
    "button": "Entrar",
    "social": "Continuar com Google",
    "or": "ou"
  },
  "register": {
    "title": "Crie sua conta",
    "button": "Criar Conta"
  },
  "errors": {
    "fillAllFields": "Preencha todos os campos"
  }
}
```

```jsx
t('tabs.login')           // → "Entrar"
t('login.title')          // → "Bem-vindo de volta!"
t('errors.fillAllFields') // → "Preencha todos os campos"
```

---

## Interpolação de variáveis

Para strings com valores dinâmicos, use a sintaxe `{{variavel}}` no JSON e passe um objeto como segundo argumento para `t()`:

```json
// feed.json
{
  "createPost": {
    "text": {
      "charCount": "{{count}}/500"
    }
  }
}
```

```jsx
t('createPost.text.charCount', { count: 120 }) // → "120/500"
```

---

## Trocar o idioma — `useLanguage`


No momento estamos usando o componente de troca de idioma que chama o hook `useLanguage` (em `src/hooks/useLanguage.js`) centraliza a lógica de troca e leitura do idioma atual:

```jsx
import { useLanguage } from '@/hooks/useLanguage';

function MeuComponente() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <button onClick={() => changeLanguage('en')}>
      Idioma atual: {currentLanguage}
    </button>
  );
}
```

- `currentLanguage` — string com o código do idioma atual (`'pt'`, `'en'`, `'es'`)
- `changeLanguage(code)` — altera o idioma globalmente, persiste no `localStorage` e atualiza todos os componentes que usam `useTranslation`

> **Nota:** A persistência está no `localStorage`. Para salvar no banco de dados no futuro, altere apenas o interior da função `changeLanguage` no hook — o restante do sistema não precisa mudar.

---

## Adicionando uma nova string de tradução

**Passo a passo:**

1. **Identifique o namespace** correto para a feature (ex: `feed`, `profile`, `auth`)
2. **Adicione a chave** no arquivo `pt/[namespace].json` (idioma base)
3. **Adicione a tradução** nos arquivos `en/[namespace].json` e `es/[namespace].json`
4. **Use no componente** com `t('caminho.da.chave')`

**Exemplo:** Adicionar a string "Publicação deletada com sucesso" no feed.

```json
// pt/feed.json
{
  "list": {
    "deleteSuccess": "Publicação deletada com sucesso"
  }
}

// en/feed.json
{
  "list": {
    "deleteSuccess": "Post deleted successfully"
  }
}

// es/feed.json
{
  "list": {
    "deleteSuccess": "Publicación eliminada con éxito"
  }
}
```

```jsx
const { t } = useTranslation('feed');
toast.success(t('list.deleteSuccess'));
```

---

## Adicionando um novo namespace

Se uma nova feature precisar de traduções próprias:

1. Crie `src/i18n/locales/pt/[feature].json`
2. Crie `src/i18n/locales/en/[feature].json`
3. Crie `src/i18n/locales/es/[feature].json`
4. Importe e registre os três arquivos em `src/i18n/index.js`
5. Use `useTranslation('[feature]')` nos componentes da feature

---

## Boas práticas

- **Nunca** escreva strings visíveis ao usuário diretamente no JSX — sempre use `t()`
- Mantenha as chaves em **inglês** (ex: `login.title`, não `login.titulo`) para consistência
- Use **aninhamento** para agrupar chaves relacionadas, mas evite profundidade excessiva (máximo 3 níveis)
- Se uma string for usada em múltiplas features, coloque-a em `common.json`
- Ao usar `placeholder` em inputs, passe a tradução como: `placeholder={t('login.emailPlaceholder')}`
- Para mensagens de toast (sucesso/erro), use o namespace da provider ou da feature correspondente

---

## Datas e formatação com locale

A função `getCurrentTime` aceita um segundo argumento com o código do idioma para formatar datas no locale correto:

```jsx
import { useLanguage } from '@/hooks/useLanguage';
import { getCurrentTime } from '@/shared/getCurrentTime';

function PostCard({ post }) {
  const { currentLanguage } = useLanguage();

  return (
    <span>{getCurrentTime(post.created_at, currentLanguage)}</span>
  );
}
```

Isso garante que datas como "há 2 horas" sejam exibidas no idioma correto do usuário.

---

## LanguageSwitcher e ReactPortal

O componente `LanguageSwitcher` usa `createPortal` do React para renderizar o dropdown diretamente no `document.body`, fora da hierarquia DOM do componente pai. Isso resolve o problema de **clipping** que ocorria quando o componente era usado dentro de modais (o `overflow: hidden` do modal cortava o dropdown).

O portal calcula dinamicamente a posição do dropdown com base nas coordenadas do botão (`getBoundingClientRect`) e ajusta automaticamente para não ultrapassar as bordas da tela.

```jsx
// Dentro de LanguageSwitcher.jsx (simplificado)
import { createPortal } from 'react-dom';

{isOpen && position && createPortal(
  <div style={{ position: 'absolute', top: position.top, left: position.left }}>
    {/* opções de idioma */}
  </div>,
  document.body
)}
```

> Se futuramente o dropdown precisar ser usado em outros contextos que também causem problemas de posicionamento, a mesma abordagem com `createPortal` pode ser aplicada.
