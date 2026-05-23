# Friend Discovery — Documentação do Módulo

## Visão Geral

O módulo **Friend Discovery** permite que usuários autenticados descubram novas amizades através de uma busca avançada com filtros textuais, geográficos, de idioma e ordenação personalizada. A busca é otimizada no banco de dados via índices GIN trigram e retorna, para cada resultado, o status atual de relacionamento entre o usuário logado e o perfil encontrado.

***

## Arquitetura

```
Frontend                         Backend                       Database
─────────────────                ──────────────────────        ──────────────────────
FriendDiscovery (view)
  ├── SearchInput                GET /user/search              users (GIN indexes)
  ├── SearchFilters        ───►  UserDiscoveryService    ───►  user_preferences
  ├── FriendDiscoveryList        UserResource                  friendships (composite index)
  └── DetailedFriendCard

useFriendSearch (hook)
friendService.searchFriends
```

***

## Backend

### Endpoint: `GET /user/search`

**Autenticação:** Bearer Token (obrigatório)

| Parâmetro | Tipo | Default | Validação | Descrição |
|-----------|------|---------|-----------|-----------|
| `q` | `string` | — | — | Busca em nome, username e bio |
| `location` | `string` | — | — | Filtro parcial por localização |
| `language` | `string` | — | `pt-BR\|en-US\|es-ES\|all` | Idioma preferido do usuário |
| `sortBy` | `string` | `createdAt` | — | Campo de ordenação |
| `sortDir` | `string` | `desc` | `asc\|desc` | Direção da ordenação |
| `page` | `int` | `0` | `min=0` | Página atual (offset) |
| `size` | `int` | `6` | `min=1, max=100` | Resultados por página |

**Campos de `sortBy` aceitos:**

| Valor | Campo ordenado |
|-------|---------------|
| `createdAt` | `u.createdAt` (default) |
| `name` | `u.name` (alfabético) |
| `lastLogin` | `u.lastLogin` |
| `mutualFriends` | Subquery de contagem de amigos em comum |

**Resposta (`PageResponse<UserSearchDTO>`):**

```json
{
  "items": [
    {
      "id": 42,
      "name": "Maria Silva",
      "username": "mariasilva",
      "avatarUrl": "https://...",
      "bio": "Desenvolvedora apaixonada por jogos",
      "location": "São Paulo, Brasil",
      "language": "pt-BR",
      "relationStatus": "NONE",
      "friendshipId": null,
      "mutualFriendsCount": 3
    }
  ],
  "page": 0,
  "size": 6,
  "hasMore": true
}
```

**Valores de `relationStatus`:**

| Valor | Significado |
|-------|-------------|
| `NONE` | Sem relação |
| `PENDING_SENT` | Pedido enviado pelo usuário logado |
| `PENDING_RECEIVED` | Pedido recebido pelo usuário logado |
| `ACCEPTED` | Já são amigos |

***

### Endpoint: `GET /friendships/me/pending-status`

Verifica se o usuário logado possui pedidos de amizade pendentes recebidos.

**Resposta:**
```json
{ "hasPendingRequests": true }
```

***

### `UserDiscoveryService`

Serviço principal de busca localizado em `com.ft.transcendence.user.app`.

#### Fluxo de execução de `searchUsers`

1. **`buildSearchQuery`** — monta HQL dinâmico excluindo o próprio usuário logado
2. **`applyFilters`** — adiciona cláusulas `AND` para `q`, `location` e `language`
3. **`applySorting`** — aplica ordenação; `mutualFriends` usa subquery correlacionada
4. **`fetchLanguageMap`** — busca em batch as preferências de idioma dos usuários da página
5. **`fetchMutualFriendsMap`** — conta amigos em comum via `JOIN` em `Friendship`
6. **`fetchFriendshipRelations`** — carrega relações existentes entre o usuário logado e os resultados
7. **`mapToDTO`** — monta `UserSearchDTO` com status de relacionamento resolvido

#### Tratamento de acentos

A função SQL imutável `f_unaccent(text)` é aplicada nos campos `name`, `biography` e `location` tanto nos índices quanto nas queries, garantindo que "Maria" encontre "Mária" e vice-versa.

***

## Migrations

### `V20__add_search_indexes.sql`

```sql
-- Extensões PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Função imutável para uso em índices funcionais
CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT AS $$
    SELECT unaccent('unaccent'::regdictionary, $1);
$$;

-- Índices GIN trigram (busca parcial ILIKE)
CREATE INDEX idx_users_name_trgm     ON users USING gin (f_unaccent(name) gin_trgm_ops);
CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
CREATE INDEX idx_users_bio_trgm      ON users USING gin (f_unaccent(biography) gin_trgm_ops);
CREATE INDEX idx_users_location_trgm ON users USING gin (f_unaccent(location) gin_trgm_ops);

-- Índices B-Tree auxiliares
CREATE INDEX idx_user_preferences_language ON user_preferences(language);
CREATE INDEX idx_users_last_login          ON users(last_login);
```

### `V21__mutual_friendship_index.sql`

```sql
-- Índice composto para otimizar contagem de amigos em comum
CREATE INDEX idx_friendships_mutual ON friendships (user_id, status, friend_id);
```

***

## Frontend

### Componentes

#### `FriendDiscovery`
Componente orquestrador da aba *Discover* em `FriendsView`. Instancia o hook `useFriendSearch` e distribui estado/callbacks para os filhos.

#### `SearchInput`
Campo de busca livre submetido via `<form onSubmit>`. Suporta `maxLength` configurado em `LIMITS.friendSearchMax`.

#### `SearchFilters`
Painel colapsável com quatro controles:
- **Localização** — `Input` com ícone `MapPin`
- **Idioma** — `Select` com opções `all | pt-BR | en-US | es-ES`
- **Ordenar por** — `Select` com opções `createdAt | name | mutualFriends`
- **Ordem** — `Select` com `desc | asc` + botão *Limpar filtros*

#### `FriendDiscoveryList`
Lista rolável (`Scroll`) de cards com paginação manual via botão "Carregar mais". Exibe estado de carregamento (`Loading`) e estado vazio com ilustração.

#### `DetailedFriendCard`
Card com layout responsivo (coluna em mobile, linha em desktop) exibindo:
- Avatar + nome + username + bio (truncados)
- Localização e idioma
- Contagem de amigos em comum
- `FriendshipButton` com `variant='inline'`

#### `Select` (Design System)
Novo primitivo em `design-system/primitives/Select`. Encapsula `<select>` nativo com:
- Estilo idêntico ao `Input` (borda, foco, ring, disabled)
- Suporte a ícone prefixado via prop `icon`
- Seta `ChevronDown` posicionada via `absolute`
- `appearance-none` para remover a seta nativa do browser

***

### Hook: `useFriendSearch`

Localizado em `features/friends/hooks/useFriendSearch.jsx`.

**Estado gerenciado:**

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `usersList` | `User[]` | Lista acumulada de resultados |
| `searchTerm` | `string` | Termo de busca livre |
| `locationFilter` | `string` | Filtro de localização |
| `languageFilter` | `string` | Idioma selecionado |
| `sortBy` | `string` | Campo de ordenação |
| `sortDir` | `string` | Direção de ordenação |
| `currentPage` | `number` | Página atual |
| `hasMore` | `boolean` | Indica se há mais páginas |
| `isLoading` | `boolean` | Loading da primeira busca |
| `isLoadingMore` | `boolean` | Loading do "carregar mais" |

**Funções expostas:**

- `handleSearchSubmit(e)` — reseta página para 0 e executa nova busca
- `handleLoadMore()` — busca a próxima página e acumula na lista
- `handleFriendshipAction(action, payload)` — atualização otimista de `relationStatus` e `friendshipId` sem nova requisição
- `handleClearFilters()` — reseta todos os filtros para os valores default

***

### Serviço: `friendService.searchFriends`

```js
searchFriends(page, size, q, location, language, sortBy, sortDir)
// → GET /user/search?page=0&size=6&q=maria&language=pt-BR&sortBy=createdAt&sortDir=desc
```

Parâmetros `undefined` são automaticamente omitidos pelo Axios.

***

## Testes

Cobertura de integração em `UserResourceTest.java`:

| Cenário | Resultado esperado |
|---------|--------------------|
| Busca com parâmetros default | `200 OK`, `page=0`, `size=6` |
| Busca com todos os filtros | `200 OK`, lista não nula |
| Idioma inválido (`fr-FR`) | `400 Bad Request` |
| `size=200` (acima do máximo) | `400 Bad Request` |
| `page=-1` (abaixo do mínimo) | `400 Bad Request` |
| Sem autenticação | `401 Unauthorized` |

***

## i18n

Chaves adicionadas ao namespace `friends` em `pt`, `en` e `es`:

```
discovery.filters.*    — labels do painel de filtros
discovery.languages.*  — nomes dos idiomas traduzidos
discovery.card.*       — textos do DetailedFriendCard
discovery.search.*     — placeholder, botões e estados de loading
discovery.empty.*      — mensagens de estado vazio (pt apenas)
toast.searchFailed
toast.loadMoreFailed
toast.filtersCleared
```