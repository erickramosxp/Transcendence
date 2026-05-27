# Domínio: Comment (Comentários)

O domínio de **Comment** é responsável por gerenciar a seção de comentários dentro dos posts do feed social. Ele gerencia o ciclo de vida da criação de comentários, curtidas em comentários, exclusão lógica (soft delete) e a contagem consolidada nos posts.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.comment`, organizado nas seguintes camadas:
- `domain`: Entidade `Comment` representando os comentários no banco de dados.
- `api`: `CommentResource` contendo os endpoints HTTP para operações de CRUD e interações sociais.
- `app`: `CommentService` contendo as regras de negócio de escrita, remoção, contagem e dispatch de eventos.
- `dto`: Objetos de dados de entrada (`CommentRequest`) e saída (`CommentResponse`, `CommentsByPostResponse`).

---

## 2. Entidades

### `Comment` (tabela: `comments`)
Representa um comentário feito por um usuário em um post.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `user` | `User` | `user_id` | Autor do comentário, `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `post` | `Post` | `post_id` | Post onde o comentário foi feito, `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `text` | `String` | `text` | Conteúdo textual do comentário. Limite: 500 caracteres, `nullable = false` |
| `likeCount` | `Long` | `like_count` | Contador denormalizado de curtidas. Padrão: `0L`, `nullable = false` |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação da postagem do comentário. |
| `updatedAt` | `OffsetDateTime` | `updated_at` | Data de atualização física. |
| `deletedAt` | `OffsetDateTime` | `deleted_at` | Timestamp de soft delete. Se não for nulo, indica que foi excluído. |

---

## 3. Endpoints REST (`CommentResource`)
Todos os endpoints exigem autenticação ativa (`@Authenticated`).

Base path: `/comment`

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `POST` | `/comment` | `CommentRequest` | `CommentResponse` | Cria um comentário em um post |
| `GET` | `/comment/{postId}` | — | `CommentsByPostResponse` | Recupera todos os comentários ativos de um post |
| `POST` | `/comment/{commentId}/like` | — | `204 No Content` | Curte um comentário (idempotente) |
| `POST` | `/comment/{commentId}/unlike`| — | `204 No Content` | Remove a curtida de um comentário |
| `DELETE`| `/comment/{commentId}` | — | `204 No Content` | Remove logicamente (soft delete) um comentário |

---

## 4. Regras de Negócio Importantes

1. **Validação do Texto**:
   - O comentário não pode ser nulo ou vazio e possui tamanho máximo estrito de **500 caracteres**. Qualquer estouro gera `BadRequestException`.
2. **Atualização da Contagem no Post**:
   - Ao adicionar um comentário, o campo `commentCount` na tabela de `posts` é incrementado atomicamente via atualização direta de banco.
   - Ao excluir um comentário, o campo `commentCount` é decrementado de forma análoga.
3. **Fluxo de Deleção Invertido (Soft Delete)**:
   - Os comentários são soft-deleted (marcando a data no campo `deletedAt`).
   - *Nota de Implementação*: O processo de exclusão adquire um bloqueio pessimista (`LockModeType.PESSIMISTIC_WRITE`) no comentário para evitar concorrência nociva nas atualizações de saldo e deleção de dependências.
   - Ao excluir o comentário, todas as suas curtidas associadas na tabela de `likes` são **deletadas fisicamente (hard delete)**.
4. **Resolução de Avatares Otimizada**:
   - Ao carregar a lista de comentários de um post, o sistema consulta as mídias de avatar em lote e utiliza um cache local (`HashMap`) durante o mapeamento do request. Isso previne o problema clássico de consultas N+1 ao storage para carregar avatares de autores repetidos.
5. **Notificações Sociais**:
   - A criação de um comentário em um post dispara automaticamente uma notificação do tipo `COMMENT_POST` para o autor do post, exceto se o autor do comentário for o próprio dono do post (auto-comentário).
6. **Controle de Acesso na Deleção**:
   - Apenas o autor do comentário pode deletá-lo (validado através de `!comment.user.id.equals(userId)` para assegurar que apenas terceiros sejam bloqueados).
