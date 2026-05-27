# Domínio: Preferences (Preferências de Interface)

O domínio de **Preferences** gerencia as configurações visuais e regionais personalizadas de cada usuário do Transcendence (Videa). Ele permite armazenar e modificar preferências de tema gráfico (como modo escuro) e idioma da interface do usuário de forma persistente.

---

## 1. Estrutura do Pacote
Pacote localizado em `com.ft.transcendence.preferences`, contendo:
- `domain`: A entidade principal `UserPreference`.
- `api`: `UserPreferenceResource` que expõe endpoints REST.
- `app`: `UserPreferenceService` concentrando a lógica de escrita e leitura de preferências.
- `dto`: Objetos de transporte especializados para atualizações totais ou granulares (idioma ou tema separadamente).

---

## 2. Entidades

### `UserPreference` (tabela: `user_preferences`)
Entidade de relacionamento 1-1 direto com o usuário do sistema.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `user` | `User` | `user_id` | O usuário dono das configurações, `@OneToOne`, `nullable = false` |
| `theme` | `String` | `theme` | Tema visual escolhido (ex: `"light"`, `"dark"`). |
| `language` | `String` | `language` | Idioma de preferência configurado (ex: `"pt-BR"`, `"en-US"`). |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação. |
| `updatedAt` | `OffsetDateTime` | `updated_at` | Data de atualização física. |

#### Criação de Valores Padrão (Factory Method)
A classe expõe o método estático `createDefaultPreferences(User user, OffsetDateTime now)` que atua como inicializador do sistema de preferências, definindo de forma consistente:
- **Tema padrão**: `"light"`
- **Idioma padrão**: `"pt-BR"`

Este método é acionado de forma transparente pelos fluxos de registro local ou social no domínio de **Auth** no momento de criação das contas de usuário.

---

## 3. Endpoints REST (`UserPreferenceResource`)
Todos os endpoints são privados e exigem autenticação ativa via `@Authenticated` nas requisições.

Base path: `/preferences`

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `GET` | `/preferences` | — | `UserPreferenceResponse` | Recupera as preferências de tema e idioma do usuário logado |
| `PATCH` | `/preferences/language`| `LanguagePreferenceDTO`| `LanguagePreferenceDTO`| Atualiza exclusivamente o idioma de exibição |
| `PATCH` | `/preferences/theme` | `ThemePreferenceDTO` | `ThemePreferenceDTO` | Atualiza exclusivamente o tema gráfico |
| `PUT` | `/preferences` | `UserPreferenceRequest` | `UserPreferenceResponse` | Executa a atualização total e simultânea de tema e idioma |

---

## 4. Regras de Negócio Importantes

1. **Validação de Conteúdo**:
   - Os endpoints de atualização granular (`PATCH`) e integral (`PUT`) realizam checagens rigorosas de conteúdo em nível de serviço. Valores nulos ou em branco geram `BadRequestException`.
2. **Resolução de Usuário Logado**:
   - O controlador faz uso do utilitário `@Inject CurrentUser` para obter de forma nativa e segura o identificador contido no JWT assinado, impedindo qualquer injeção fraudulenta ou modificação em configurações de contas de terceiros.
3. **Padrão de Consulta Direto**:
   - O domínio adota o padrão Active Record da Panache diretamente nos métodos de serviço (`UserPreference.find("user.id = ?1", userId).firstResult()`), dispensando a criação de repositórios intermediários redundantes.
