# Domínio: User (Usuários, Perfis e Busca Avançada)

O domínio de **User** gerencia a identidade de perfis, detalhes públicos de usuários, manipulação de arquivos estáticos de perfis (avatares e banners) e implementa um motor de busca altamente parametrizado com filtragem de linguagem e localização geográfica.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.user`, composto por:
- `domain`: A entidade principal `User`.
- `api`: `UserResource` que expõe endpoints privados de CRUD, carregamento de históricos de feeds pessoais, curtidas e buscas.
- `app`:
  - `UserService`: Concentra as regras de alteração de campos, regras de amizade/follow acopladas e deleções físicas de mídias de avatar.
  - `UserAvatarService`: Serviço especializado que resolve dinamicamente as URLs dos avatares integrando banco ORM e storage de objetos de forma performática.
  - `UserDiscoveryService`: Motor de busca dinâmico utilizando HQL parametrizada para busca textual accent-insensitive.
- `dto`: Modelos de dados contendo payloads de edição de perfil e estruturas complexas de resultados de busca.

---

## 2. Entidades

### `User` (tabela: `users`)
Entidade que mapeia as contas de usuários.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `email` | `String` | `email` | E-mail do usuário. `NOT NULL`, `UNIQUE` |
| `username` | `String` | `username` | Identificador textual exclusivo da URL do perfil. `NOT NULL`, `UNIQUE` |
| `name` | `String` | `name` | Nome amigável de exibição pública. |
| `avatarUrl` | `String` | `avatar_url` | Caminho/URL da imagem do avatar. |
| `bannerImgUrl`| `String` | `banner_image_url`| Caminho/URL da capa do perfil. |
| `active` | `boolean` | `active` | Flag de status da conta (padrão: `true`). |
| `biography` | `String` | `biography` | Texto de bio. Limite: 160 caracteres. |
| `websiteUrl` | `String` | `website_url` | URL do website pessoal. Máx: 100 caracteres. |
| `location` | `String` | `location` | Localidade física. Máx: 100 caracteres. |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação. |
| `updatedAt` | `OffsetDateTime` | `updated_at` | Data de atualização física. |
| `lastLogin` | `OffsetDateTime` | `last_login` | Último login registrado. |

---

## 3. Endpoints REST (`UserResource`)
Todos os endpoints exigem autenticação ativa via `@Authenticated`.

Base path: `/user`

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `GET` | `/user/{username}` | — | `UserPageResponse` | Obtém todos os dados da página pública do perfil e status de relação |
| `PATCH` | `/user/profile` | `UpdateUserProfileRequest`| `UpdateUserProfileResponse`| Atualiza os campos textuais básicos da conta do usuário logado |
| `GET` | `/user/{username}/likes`| — | `UserPostsResponse` | Lista as publicações curtidas pelo usuário correspondente |
| `GET` | `/user/{username}/posts`| — | `UserPostsResponse` | Lista as publicações criadas pelo usuário correspondente |
| `GET` | `/user/{username}/media`| — | `UserMediaResponse` | Retorna um grid contendo apenas posts com mídias do usuário |
| `PATCH` | `/user/avatar` | `FileUploadForm` (Multipart)| `UpdateAvatarResponse`| Faz upload e processa uma nova imagem de avatar |
| `DELETE`| `/user/me/avatar` | — | `204 No Content` | Remove o avatar da conta e apaga arquivos do storage |
| `PATCH` | `/user/banner` | `UpdateBannerRequest` | `204 No Content` | Atualiza a URL da capa de banner |
| `GET` | `/user/search` | — (query params) | `PageResponse<UserSearchDTO>`| Motor de busca parametrizado avançado de perfis |

---

## 4. O Mecanismo Inteligente de Avatar (`UserAvatarService`)
Para manter a compatibilidade com a evolução da arquitetura do Transcendence (que migrou de armazenar URLs estáticas de imagens para usar a tabela polimórfica de `Media`), o `UserAvatarService` implementa uma **estratégia híbrida de resolução**:

1. Ao buscar o avatar de um usuário, ele consulta a tabela `media` filtrando por `modelType = 'USER_PROFILE'` e `modelId = user.id`.
2. Se houver um registro completo, ele extrai os arquivos original, preview e blur e gera URLs seguras assinadas de curta expiração.
3. Se não houver registro no módulo de mídias, ele recorre de forma transparente ao campo legado `user.avatarUrl`.
4. **Resolução em Lote (Batch Optimization)**: Para evitar custos excessivos de queries ao banco de dados em loops N+1 (ex: renderizar listas de feed ou chat), o serviço realiza a resolução em lote, pré-carregando os avatares de todos os IDs envolvidos em uma única chamada.

---

## 5. Upload e Limpeza Física de Avatar
O fluxo de atualização de avatar garante que mídias antigas órfãs não acumulem no storage de arquivos:

1. O arquivo é recebido, validado em tipo e tamanho (máx 5MB) via `MediaValidationService`.
2. A nova imagem é enviada ao storage sob o path: `users/{userId}/avatar/avatar_{UUID}.png`.
3. O sistema cria e associa um novo registro de `Media` do tipo polimórfico correspondente e atualiza a propriedade `avatarUrl` no banco da entidade `User`.
4. O sistema captura os caminhos das **mídias de avatar antigas** associadas àquela conta e dispara uma solicitação para o módulo de Jobs assíncronos (`JobService.createDeleteMediaJob`) para expurgar fisicamente as imagens antigas originais, preview e blur do MinIO em background.

---

## 6. Motor de Busca e Descoberta (`UserDiscoveryService`)
O endpoint `/user/search` disponibiliza filtros avançados e ordenações complexas:

- **Busca Accent-Insensitive (Sem Acentos)**: A busca textual pelo parâmetro `q` é insensível a acentos no banco PostgreSQL. O serviço constrói HQL dinâmica aplicando a função nativa de banco `f_unaccent(coluna)` para garantir que uma busca por "erick" retorne "Érick" de forma perfeita.
- **Filtros Adicionais**: Filtra opcionalmente por `location` (localização) e `language` (idioma de preferência extraído dinamicamente das preferências do usuário).
- **Mapeamento de Status de Relação**: A lista de resultados de busca já retorna de forma enriquecida o estado social de conexão entre o usuário buscador e o resultado exposto: `SELF` (se for o próprio usuário logado), `ACCEPTED` (amigos mútuos), `PENDING_SENT` (convite enviado), `PENDING_RECEIVED` (convite recebido) ou `NONE`.
- **Cálculo de Amigos Mútuos**: Se houver amizade, o sistema calcula através de subquery o saldo de amigos mútuos compartilhado e expõe a contagem no DTO.
- **Ordenação Dinâmica**: Suporta ordenações por data de criação (`createdAt`), último login (`lastLogin`), username ou quantidade de amigos mútuos em comum.
