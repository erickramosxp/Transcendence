# Registro de Mudanças

## 1. Paginação em Followers e Following

**Arquivos:** `UserResource.java`, `UserService.java`

Os endpoints `GET /{username}/followers` e `GET /{username}/following` passaram a suportar paginação via query params `page` e `size`.

**Antes**, os endpoints retornavam a lista completa de seguidores/seguidos sem nenhum controle de volume:

```java
public UserFollowListResponse followers(@PathParam("username") String username) { ... }
public UserFollowListResponse following(@PathParam("username") String username) { ... }
```

**Depois**, ambos aceitam `page` (padrão `0`) e `size` (padrão `20`) e retornam um `PageResponse<UserFollowResponse>` com flag `hasMore` para controle de scroll infinito. A URL do avatar agora é gerada via `storageService` dentro do próprio serviço:

```java
public PageResponse<UserFollowResponse> followers(
    @PathParam("username") String username,
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size) { ... }
```

A query usa `.range(start, end)` do Panache e busca `size + 1` registros para determinar `hasMore` sem custo de `COUNT`.

---

## 2. Correção de Concorrência no CommentService

**Arquivo:** `CommentService.java`

O incremento do contador de comentários de um post era feito via atribuição direta sobre a entidade carregada em memória:

```java
post.commentCount = post.commentCount + 1;
```

Esse padrão sofre de race condition: duas requisições simultâneas leem o mesmo valor e ambas gravam `valor + 1`, resultando em perda de um incremento.

A correção substitui a atribuição por um `UPDATE` atômico via JPQL, análogo ao que já havia sido feito no `LikeService`:

```java
entityManager.createQuery(
    "UPDATE Post SET commentCount = commentCount + 1 WHERE id = :id"
).setParameter("id", req.postId).executeUpdate();
```

O `EntityManager` foi injetado no serviço para viabilizar essa operação.

> **Nota:** diferente do like, o insert do comentário em si não precisou de `ON CONFLICT DO NOTHING`, pois não existe constraint de unicidade — um usuário pode comentar várias vezes no mesmo post.

---

## 3. Validação de Amizade na Criação de Chats

**Arquivo:** `ChatService.java`

Adicionada a restrição de que só é possível criar chats entre usuários que já sejam amigos (`FriendshipStatus.ACCEPTED`).

### Helper `areFriends`

Um método privado centraliza a verificação nas duas direções da tabela `friendships`:

```java
private boolean areFriends(Long userAId, Long userBId) {
    return Friendship.count(
        "(userId = ?1 and friendId = ?2 and status = ?3) or " +
        "(userId = ?2 and friendId = ?1 and status = ?3)",
        userAId, userBId, FriendshipStatus.ACCEPTED
    ) > 0;
}
```

### `createDirectChat`

A validação ocorre após confirmar que ambos os usuários existem:

```java
if (!areFriends(currentUserId, userBId))
    throw new ForbiddenException("You can only start a conversation with friends");
```

Retorna `403 Forbidden` caso a amizade não exista ou ainda esteja pendente.

### `createGroupChat`

A validação é feita por participante dentro do loop de criação:

```java
if (!areFriends(currentUserId, userId))
    throw new ForbiddenException("User with id=" + userId + " is not your friend");
```

Se qualquer um dos participantes não for amigo do criador, a criação do grupo é rejeitada com `403`, identificando o id do usuário problemático.
