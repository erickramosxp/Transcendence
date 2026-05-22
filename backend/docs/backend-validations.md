# Backend Validations

Registro das validações implementadas no backend (Quarkus). Cada seção indica o arquivo alterado, o que foi adicionado e a camada usada (anotação Bean Validation no DTO e/ou verificação manual no Service).

---

## Autenticação — Login

### `auth/dto/LoginRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `password` | `@Size(max = 30)` |

### `auth/app/AuthService.java` — método `login()`

Validação de formato do identificador adicionada manualmente antes da consulta ao banco:

```java
boolean isEmail = username.contains("@");
if (isEmail) {
    if (!username.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
        throw new NotAuthorizedException("Invalid identifier");
} else {
    if (!username.matches("^[a-zA-Z0-9_]{3,30}$"))
        throw new NotAuthorizedException("Invalid identifier");
}
```

> O trim do identificador já existia (`username.trim()`).

---

## Autenticação — Registro

### `auth/dto/RegisterRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `name` | `@Size(min = 3, max = 30)` |
| `username` | `@Size(min = 3, max = 30)` |
| `password` | `@Size(min = 8, max = 30)` |

### `auth/app/AuthService.java` — método `validateRegister()`

Validações de formato adicionadas manualmente (as checagens de null/blank já existiam):

```java
if (!req.email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
    throw new NotAuthorizedException("Invalid identifier of email");
if (!req.username.matches("^[a-zA-Z0-9_]{3,30}$"))
    throw new NotAuthorizedException("Invalid identifier of username");
```

---

## Autenticação — Troca de Senha

### `auth/app/AuthService.java` — método `changePassword()`

Adicionada verificação de tamanho máximo da nova senha (a checagem de mínimo 8 já existia):

```java
if (req.newPassword.length() > 30)
    throw new BadRequestException("New password must be at most 30 characters");
```

> `ChangePasswordRequest.java` não foi alterado.

---

## Perfil — Editar Perfil

### `user/dto/UpdateUserProfileRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `name` | `@Size(min = 3, max = 30)` |
| `bio` | `@Size(max = 160)` |
| `location` | `@Size(max = 100)` |
| `websiteUrl` | `@Size(max = 100)` |

### `user/app/UserService.java` — método `updateProfile()`

Verificações manuais adicionadas antes de atribuir os valores à entidade:

```java
if (req.name != null && !req.name.isBlank()) {
    String trimmed = req.name.trim();
    if (trimmed.length() < 3 || trimmed.length() > 30)
        throw new BadRequestException("Name must be between 3 and 30 characters");
    user.name = trimmed;
}
if (req.bio != null && req.bio.length() > 160)
    throw new BadRequestException("Bio must be at most 160 characters");
if (req.location != null && req.location.length() > 100)
    throw new BadRequestException("Location must be at most 100 characters");
```

---

## Feed — Comentários

### `comment/dto/CommentRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `text` | `@Size(max = 500)` |

### `comment/app/CommentService.java` — método `create()`

Checagem de tamanho máximo adicionada após o blank check existente:

```java
if (req.text.length() > 500)
    throw new BadRequestException("Comment must be at most 500 characters");
```

---

## Chat — Mensagens

### `chat/dto/ChatMessageRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `text` | `@Size(max = 4000)` |

### `chat/app/ChatMessageService.java` — método `createMessage()`

Adicionada validação de conteúdo mínimo e tamanho máximo:

```java
if (req.text == null || req.text.isBlank())
    if (req.mediaUrl == null || req.mediaUrl.isBlank())
        throw new BadRequestException("Message must contain text or media");

if (req.text != null && req.text.length() > 4000)
    throw new BadRequestException("Message must be at most 4000 characters");
```

---

## Chat — Nome de Grupo

### `chat/dto/CreateGroupChatRequest.java`

| Campo | O que foi adicionado |
|-------|----------------------|
| `chatName` | `@NotBlank` + `@Size(max = 80)` |

---

## O que não foi implementado

| Área | O que ficou de fora |
|------|----------------------|
| Registro | `termsAccepted` (checkbox obrigatório) — campo não existe no DTO |
| Troca de senha | `confirmPassword` — campo não adicionado ao DTO; igualdade de senhas não validada |
| Editar perfil | Formato do `websiteUrl` (`http://` ou `https://`) — apenas tamanho foi limitado |
