# Domínio: Like (Curtidas)

O domínio de **Like** é responsável pelas interações básicas de "curtir" e "descurtir" conteúdos gerados pelos usuários da plataforma. Ele unifica em uma única tabela as curtidas em posts do feed social e em comentários.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.like`:
- `domain`: Contém a entidade principal `Like`.
- `app`: Contém o serviço de aplicação `LikeService`.
- **Inexistência de Controladores/Recursos REST específicos**: O domínio de Like não possui um arquivo de API/Resource próprio. Ele é um módulo puramente interno de suporte, cujas ações de API estão expostas de forma acoplada diretamente nos controladores correspondentes do feed:
  - `PostResource` $\to$ `/posts/{postId}/like` e `/posts/{postId}/unlike`
  - `CommentResource` $\to$ `/comment/{commentId}/like` e `/comment/{commentId}/unlike`

---

## 2. Entidades

### `Like` (tabela: `likes`)
Entidade polimórfica que mapeia as curtidas direcionadas a posts ou a comentários de forma unificada no banco.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `user` | `User` | `user_id` | Autor da curtida. `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `post` | `Post` | `post_id` | Post curtido. `@ManyToOne(fetch = LAZY)`, nullable. |
| `comment` | `Comment` | `comment_id` | Comentário curtido. `@ManyToOne(fetch = LAZY)`, nullable. |
| `createdAt` | `OffsetDateTime` | `created_at` | Timestamp do momento do clique do like. |

> **Restrições de Integridade Única (Unique Constraints)**:
> A tabela possui duas restrições de unicidade compostas para assegurar a consistência lógica do banco de dados:
> - `uk_likes_user_post`: Garante que um usuário só possa curtir um mesmo **post** exatamente uma vez (`user_id`, `post_id`).
> - `uk_likes_user_comment`: Garante que um usuário só possa curtir um mesmo **comentário** exatamente uma vez (`user_id`, `comment_id`).

---

## 3. Funcionamento Interno e Performance

### Transações e Idempotência Nativa
Tanto o ato de curtir um post quanto o de curtir um comentário são operações concebidas para serem seguras e **idempotentes** no banco de dados. Em vez de usar queries Hibernate complexas sujeitas a condições de corrida (race conditions), o `LikeService` faz uso de inserções SQL nativas com a instrução PostgreSQL:

```sql
INSERT INTO likes (user_id, post_id, created_at)
VALUES (:userId, :postId, NOW())
ON CONFLICT (user_id, post_id) DO NOTHING;
```

Essa abordagem faz com que requisições duplicadas enviadas de forma concorrente pelo cliente (ex: cliques seguidos e rápidos no botão de curtir) não gerem exceções no banco nem insiram registros inválidos, sendo resolvidas em nível de driver Postgres de forma ultrarrápida.

### Atualização Denormalizada de Contadores
Os saldos totais de curtidas são mantidos de forma denormalizada nas respectivas tabelas de origem (`posts` e `comments` possuem campos `likeCount`) por motivos de performance na renderização de feeds.
1. O backend executa o `INSERT ... ON CONFLICT DO NOTHING`.
2. O banco retorna a contagem de linhas alteradas.
3. Se a linha foi realmente inserida (saldo alterado > 0), o sistema incrementa o contador do post/comentário correspondente usando uma query atômica JPQL: `UPDATE ... SET likeCount = likeCount + 1`.
4. No fluxo de `unlike`, remove-se a linha fisicamente e executa-se o decremento blindado para nunca ficar negativo: `UPDATE ... SET likeCount = GREATEST(likeCount - 1, 0)`.

---

## 4. Regras de Negócio Importantes

1. **Validação de Existência**:
   - Antes de efetuar a curtida, o sistema verifica se o post ou comentário de destino realmente existem e estão ativos (não deletados), lançando um `NotFoundException` em caso de ausência.
2. **Notificações Sociais**:
   - Curtir um conteúdo dispara automaticamente uma notificação para o respectivo autor do post (`LIKE_POST`) ou comentário (`LIKE_COMMENT`) via `NotificationDispatcher`.
   - *Nota de Comportamento*: A remoção de curtidas (`unlike`) **não** dispara notificações de cancelamento.
   - O disparo de notificações de curtida é **deduplicável** nativamente no banco de dados de notificações, impedindo que notificações repetidas de curtidas do mesmo usuário poluam a tela do destinatário.
3. **Telemetria**:
   - Operações bem-sucedidas de Curtir/Descurtir incrementam contadores específicos de telemetria no Prometheus através de `SocialMetrics.recordPostLike()`, `recordCommentLike()`, etc.
