# Domínio: Follow (Seguidores e Conexões)

O domínio de **Follow** gerencia os relacionamentos direcionados e não-mútuos entre os usuários do Transcendence (Videa). Ele permite que um usuário "siga" outro para ver suas atualizações no feed, sem que a recíproca seja obrigatoriamente verdadeira.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.follow`:
- É um domínio minimalista, contendo a entidade `Follow` em seu subpacote `domain`.
- **Arquitetura Descentralizada**: A lógica de API (CRUD), controle e serviços associados ao fluxo de seguidores está integrada diretamente nas classes de serviço e controlador do domínio de **User** (`UserService` e `UserResource`), tratando o follow como uma sub-feature direta de usuários.

---

## 2. Entidades

### `Follow` (tabela: `follows`)
Entidade que mapeia uma aresta direcionada no grafo de conexões da rede social: `follower` $\to$ `followee`.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `follower` | `User` | `follower_id` | O usuário que executa a ação de seguir. `@ManyToOne(fetch = LAZY)`, `optional = false` |
| `followee` | `User` | `followee_id` | O usuário que está sendo seguido. `@ManyToOne(fetch = LAZY)`, `optional = false` |
| `createdAt` | `OffsetDateTime` | `created_at` | Data em que a conexão de follow foi estabelecida. |

#### Métodos de Consulta Estáticos (Panache Active Record)
- **`countFollowers(Long userId)`**: Retorna a contagem de quantos usuários seguem o usuário fornecido (`count("followee.id = ?1", userId)`).
- **`countFollowing(Long userId)`**: Retorna a contagem de quantos usuários o usuário fornecido está seguindo (`count("follower.id = ?1", userId)`).

---

## 3. Integração com DTOs e Respostas

### `UserFollowResponse` (localizado em `com.ft.transcendence.user.dto`)
DTO de mapeamento utilizado para renderizar listas de seguidores ou seguindo com suporte a avatares pré-processados.

Possui métodos de fábrica estáticos otimizados:
- **`ofFollowers(Follow follow, String avatarUrl)`**: Mapeia o usuário `follower` (aquee que segue) com seu avatar resolvido.
- **`ofFollowing(Follow follow, String avatarUrl)`**: Mapeia o usuário `followee` (aquele que é seguido) com seu avatar resolvido.

---

## 4. Endpoints Integrados (`UserResource`)
Embora a entidade esteja no pacote `follow`, os endpoints HTTP de controle residem sob o path principal de usuários.

| Método | Caminho | Autenticado | DTO Saída | Descrição |
|---|---|---|---|---|
| `POST` | `/user/{username}/follow` | Sim (JWT) | `Response` (200) | Segue o usuário correspondente ao username |
| `POST` | `/user/{username}/unfollow`| Sim (JWT) | `Response` (200) | Deixa de seguir o usuário |
| `GET` | `/user/{username}/followers`| Sim (JWT) | `PageResponse<UserFollowResponse>`| Lista os seguidores do usuário (paginado) |
| `GET` | `/user/{username}/following`| Sim (JWT) | `PageResponse<UserFollowResponse>`| Lista quem o usuário está seguindo (paginado) |

---

## 5. Regras de Negócio Importantes

1. **Auto-Follow Bloqueado**:
   - Um usuário **não pode** seguir a si mesmo. O backend impede isso gerando uma `IllegalArgumentException`.
2. **Operações Idempotentes**:
   - Tentar seguir um usuário que você já segue não gera erros no banco ou conflitos de chave primária. O sistema detecta a aresta existente silenciosamente e retorna sucesso.
3. **Resolução Dinâmica de Listagens**:
   - O carregamento de listas de seguidores e seguindo usa o padrão de paginação range-based e enriquece os DTOs em lote através do `UserAvatarService` para evitar o custo de queries N+1 no banco e requisições excessivas de assinatura de URLs no storage.
