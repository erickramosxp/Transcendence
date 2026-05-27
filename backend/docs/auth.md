# Domínio: Auth (Autenticação)

O domínio de **Auth** é responsável por gerenciar toda a autenticação, registro de novos usuários e autorização de acesso a endpoints do Transcendence (Videa). Ele suporta fluxo local de e-mail e senha bem como login social integrado com o Google OAuth2.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.auth`, segue a arquitetura em camadas:
- `domain`: Entidades JPA representando credenciais e provedores.
- `api`: Controladores REST (JAX-RS) expondo os endpoints.
- `app`: Serviços contendo a lógica de negócio (registro, emissão de JWT, validação).
- `dto`: Objetos de transferência de dados (solicitações e respostas).
- `infra`: Integração com serviços externos (ex: REST Client da API do Google).

---

## 2. Entidades

### `AuthProvider` (tabela: `auth_provider`)
Representa a credencial de autenticação de um usuário. Um mesmo usuário pode ter múltiplos provedores de login (ex: login local e login via Google associados à mesma conta).

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `user` | `User` | `user_id` | `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `providerType` | `AuthProviderType` (Enum) | `provider_type` | `@Enumerated(STRING)`, mapeado para enum Postgres |
| `providerUserId` | `String` | `provider_user_id` | ID único retornado pelo provedor (ex: `sub` do Google). Nulo para `LOCAL`. |
| `passwordHash` | `String` | `password_hash` | Hash Bcrypt da senha. Nulo para `GOOGLE`. |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação, `@CreationTimestamp` |

#### `AuthProviderType` (Enum)
- `LOCAL`: Login por e-mail/username e senha criptografada.
- `GOOGLE`: Login social via Google OAuth2.
- `GITHUB`: Reservado para implementações futuras.

---

## 3. Endpoints REST (`AuthResource` e `MeResource`)

### `AuthResource` (`@Path("/auth")`)
Todos os endpoints desta classe são públicos (exceto a alteração de senha).

| Método | Caminho | Autenticado | Consome / Produz | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|---|---|
| `POST` | `/auth/register` | Não | JSON | `RegisterRequest` | `AuthResponse` | Registra uma nova conta local |
| `POST` | `/auth/login` | Não | JSON | `LoginRequest` | `AuthResponse` | Autentica via e-mail ou username + senha |
| `POST` | `/auth/google` | Não | JSON | `GoogleLoginRequest` | `AuthResponse` | Realiza login/registro usando o código do Google OAuth2 |
| `PATCH` | `/auth/password` | Sim (JWT) | JSON | `ChangePasswordRequest` | `204 No Content` | Altera a senha do usuário autenticado |

### `MeResource` (`@Path("/me")`)
Utilizado para verificar a validade da sessão e retornar o perfil do usuário logado.

| Método | Caminho | Autenticado | DTO Saída | Descrição |
|---|---|---|---|---|
| `GET` | `/me` | Sim (JWT) | `UserResponse` | Retorna o perfil completo extraído do JWT |

---

## 4. Regras de Negócio Importantes

1. **Unicidade de Identificadores**: 
   - O e-mail e o username devem ser únicos em toda a plataforma. O registro local valida isso e lança erros específicos em caso de conflito.
2. **Validação de Formato**:
   - O username deve possuir entre 3 e 30 caracteres e seguir a regex: `^[a-zA-Z0-9_]{3,30}$`.
   - O e-mail deve ser válido, seguindo a regex: `^[^@\s]+@[^@\s]+\.[^@\s]+$`.
   - Senhas locais devem conter no mínimo 8 e no máximo 30 caracteres.
3. **Criptografia de Senhas**:
   - Armazenadas de forma segura no banco usando o algoritmo **Bcrypt** (`BcryptUtil.bcryptHash()` do Quarkus Security).
4. **Vínculo Automático de Provedor (Account Linking)**:
   - Ao logar com o Google, se o e-mail retornado já possuir uma conta local registrada na plataforma, o provedor do Google é associado a essa conta existente de maneira transparente (desde que o e-mail do Google esteja verificado).
5. **Geração Automática de Username**:
   - Usuários registrados via Google que não possuem username local pré-definido ganham um gerado a partir do prefixo do e-mail. Se houver conflito de duplicidade, adiciona-se um sufixo numérico randômico.
6. **Preferências Iniciais**:
   - Qualquer fluxo de registro bem-sucedido (local ou Google) cria automaticamente um registro correspondente de preferências (`UserPreference`) com o tema padrão `light` e idioma `pt-BR`.
7. **Emissão de JWT**:
   - Os tokens JWT contêm as claims: `upn` (e-mail do usuário), `uid` (ID único no banco), `name` (nome visível) e `username`. São assinados usando a infraestrutura do MicroProfile JWT do Quarkus.
8. **Rastreamento de Métricas**:
   - O sucesso ou falha no login, registros locais e logins via Google disparam contadores de métricas no Micrometer (`social.auth.logins.total`, `social.auth.registrations.total`).
