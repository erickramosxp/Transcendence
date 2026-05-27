# Domínio: Editorial (Notícias e Robô de Conteúdo)

O domínio de **Editorial** é responsável por alimentar a rede social do Transcendence (Videa) com notícias de fontes reais do mundo inteiro de forma totalmente automatizada. Ele se integra à **GNews API**, processa os artigos, realiza a ingestão e publica posts na rede social sob o perfil de um usuário especial do tipo bot (`videanews`).

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.editorial` e dividido nas seguintes áreas:
- `domain`: Entidade `IngestedNews` para persistir e evitar duplicações de notícias.
- `api`: `EditorialResource` que fornece controle manual de ingestão e feed específico.
- `app`: Serviços de ingestão automática, formatação de textos de posts, inicialização de avatar e scheduler.
- `client`: REST Client baseado no MicroProfile REST Client para se comunicar diretamente com a GNews API.
- `config`: Definição de propriedades de mapeamento (`gnews` e `editorial`).
- `dto`: Modelos de resposta da API de notícias e DTOs de leitura de headlines.

---

## 2. Entidades

### `IngestedNews` (tabela: `ingested_news`)
Entidade utilizada para registrar o histórico de todas as matérias já consumidas e convertidas em postagens sociais na plataforma.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `sourceUrl` | `String` | `source_url` | URL fonte da notícia. Limite: 2048 chars, `NOT NULL`, `UNIQUE` |
| `externalId` | `String` | `external_id` | Identificador externo, máx 512 chars. |
| `title` | `String` | `title` | Título do artigo. Limite: 500 chars, `NOT NULL` |
| `summary` | `String` | `summary` | Corpo resumido ou descrição da notícia (tipo TEXT). |
| `sourceName` | `String` | `source_name` | Nome da fonte jornalística (ex: "G1", "CNN"). |
| `imageUrl` | `String` | `image_url` | Link original da imagem da notícia. Limite: 2048 chars. |
| `post` | `Post` | `post_id` | Post social correspondente criado na plataforma, `@ManyToOne(fetch = LAZY)` |
| `publishedAt` | `OffsetDateTime` | `published_at` | Data de publicação original fornecida pela agência. |
| `ingestedAt` | `OffsetDateTime` | `ingested_at` | Timestamp de quando a matéria foi processada pela aplicação. |

---

## 3. Endpoints REST (`EditorialResource`)

Base path: `/editorial`

| Método | Caminho | Autenticado | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|---|
| `GET` | `/editorial/headlines` | Sim (JWT) | — | `HeadlinesResponse` | Obtém as últimas matérias ingeridas pelo sistema (limite configurável) |
| `POST` | `/editorial/ingest` | **Não** | — | `NewsIngestionResult` | Dispara manualmente o gatilho de ingestão e scraping |

> **Nota de Segurança**: O endpoint `/editorial/ingest` é intencionalmente público para permitir agendamentos externos de cron/webhooks, mas seu uso inadequado pode ser controlado adicionando validação de token específico ou cabeçalho.

---

## 4. Agendamento Automático (Scheduler)
A classe `NewsIngestionScheduler` configura uma tarefa recorrente integrada ao agendador do Quarkus (`quarkus-scheduler`):
- **Periodicidade**: `@Scheduled(every = "15m", concurrentExecution = SKIP)`
- **Comportamento**: A cada **15 minutos**, o robô roda em background. Se uma execução anterior estiver atrasada ou em andamento, a nova execução é pulada (`SKIP`) para preservar recursos do banco e evitar bloqueios na chave única de notícias.

---

## 5. Regras de Negócio Importantes

1. **Configuração Opcional**:
   - Se a propriedade `GNEWS_API_KEY` não for configurada no ambiente (nula ou vazia), o agendador não falha — ele apenas interrompe a ingestão silenciosamente e registra no log.
2. **Deduplicação de Artigos**:
   - A URL de origem (`sourceUrl`) é a chave única. Antes de persistir e criar um post, o sistema consulta `IngestedNews.existsBySourceUrl(url)`. Artigos duplicados são descartados sem gerar erros visíveis.
3. **Seeding e Usuário Especial (`videanews`)**:
   - A plataforma depende da existência de um usuário bot do sistema chamado `videanews` (criado por migrations automáticas do Flyway). Se este usuário for removido, o serviço de notícias lança um erro `NotFoundException`.
4. **Formatação Inteligente de Posts (`NewsPostFormatter`)**:
   - O feed da plataforma possui limite estrito de **500 caracteres** por post.
   - O robô formata a notícia combinando o título e a descrição.
   - Se a descrição iniciar repetindo o título da matéria, a parte duplicada é removida automaticamente.
   - Adiciona-se uma quebra de linha com a fonte: `\n\n🔗 <URL_ORIGINAL>`.
   - Se o resultado estourar o limite de 500 caracteres, o texto é truncado suavemente adicionando reticências (`...`) antes da quebra da URL.
5. **Seeding do Avatar do Robô**:
   - No startup da aplicação, a classe `EditorialAvatarInitializer` garante que a imagem do robô de notícias (`videanews-avatar.png`) seja carregada de forma idempotente e configurada como imagem de perfil oficial do bot no banco e storage.
