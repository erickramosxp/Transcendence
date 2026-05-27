# Domínio: Post (Posts e Feeds Sociais)

O domínio de **Post** gerencia o núcleo do feed social da plataforma Transcendence (Videa). Ele controla a criação de publicações contendo texto e mídias, estruturação de feeds baseados em escopos (notícias editoriais vs interações sociais) e a remoção em cascata com expurgos físicos no storage MinIO de forma assíncrona.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.post`, estruturado em camadas tradicionais:
- `domain`: A entidade principal `Post` no banco de dados.
- `api`: `PostResource` que disponibiliza endpoints de escrita, leitura de feeds e likes.
- `app`: `PostService` concentrando a complexidade de transações, integração com validação de mídias e jobs assíncronos.
- `dto`: Formulários multiparts para upload e modelos de visualização de feeds.

---

## 2. Entidades

### `Post` (tabela: `posts`)
Representa uma publicação feita por um usuário na plataforma.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `user` | `User` | `user_id` | Autor do post, `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `text` | `String` | `text` | Texto da publicação. Máx: 500 caracteres, nullable. |
| `mediaUrl` | `String` | `media_url` | Caminho de arquivo de imagem/vídeo original, nullable. |
| `likeCount` | `Long` | `like_count` | Contador denormalizado de curtidas. Padrão: `0`, `nullable = false` |
| `commentCount`| `Long` | `comment_count` | Contador denormalizado de comentários. Padrão: `0`, `nullable = false` |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação. |
| `updatedAt` | `OffsetDateTime` | `updated_at` | Data de atualização física. |
| `deletedAt` | `OffsetDateTime` | `deleted_at` | Timestamp de soft delete. Se preenchido, o post está inativo. |

---

## 3. Endpoints REST (`PostResource`)
Todos os endpoints exigem autenticação ativa via `@Authenticated`.

Base path: `/posts`

| Método | Caminho | Consome / Produz | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|---|
| `POST` | `/posts` | `multipart/form-data` | `CreatePostForm` | `PostResponse` | Cria um post contendo texto e/ou upload de mídias |
| `GET` | `/posts/{postId}`| JSON | — | `PostResponse` | Obtém um post específico enriquecido |
| `GET` | `/posts` | JSON | — (query params) | `FeedResponse` | Recupera posts em lote baseando-se no escopo |
| `POST` | `/posts/{postId}/like` | JSON | — | `Response` (200) | Curte o post (delegação direta para `LikeService`) |
| `POST` | `/posts/{postId}/unlike`| JSON | — | `Response` (200) | Descurte o post |
| `DELETE`| `/posts/{postId}`| JSON | — | `204 No Content` | Remove logicamente o post e suas dependências |

---

## 4. O Pipeline de Upload de Mídias
A criação de um post contendo arquivos (`CreatePostForm` via multipart) passa por um fluxo robusto de validação e processamento:

1. **Validação de Conteúdo Mínimo**: O post deve possuir texto **ou** algum arquivo físico anexado.
2. **Validação Profunda**: O arquivo é submetido ao `MediaValidationService` que analisa a assinatura de bytes e a extensão (limitando imagens a 5MB e vídeos a 20MB).
3. **Escrita no Storage**: Os arquivos são gravados na estrutura lógica de pastas do MinIO:
   - Caminho: `users/{userId}/post/{postId}/`
   - O upload de **Imagens** exige o envio obrigatório de **3 arquivos separados**: a imagem original, uma versão de preview leve (`previewFile`) e uma miniatura borrada de efeito blur (`blurFile`). O status inicial é persistido como `COMPLETED`.
   - O upload de **Vídeos** é recebido em formato bruto. O registro de mídia correspondente é salvo com o estado `PENDING` e o sistema agenda imediatamente uma tarefa assíncrona de processamento no módulo de Jobs para fazer a compressão do vídeo em codec x264 via FFmpeg e extrair as thumbnails de preview/blur dinamicamente.

---

## 5. Escopo de Feeds (Social vs Notícias)
O endpoint `/posts` realiza a leitura com suporte a dois escopos estritos via parâmetro `scope`:

- **`social`**: Carrega as publicações de todos os usuários da plataforma, **exceto** as publicações geradas pelo robô de notícias automatizado (`videanews`). É o feed focado no convívio e interação dos usuários reais.
- **`news`**: Carrega exclusivamente as publicações geradas pelo usuário especial bot do sistema editorial (`videanews`). É o feed focado no consumo de notícias mundiais consumidas via API.

---

## 6. Fluxo de Exclusão (Soft Delete)
A remoção de posts não realiza deleções físicas destrutivas de forma direta para manter integridade. Em vez disso:

1. O post recebe uma marcação temporal no campo `deletedAt` (**soft delete**).
2. Todos os comentários associados à publicação são marcados equivalentemente como soft-deleted.
3. Todas as curtidas em nível do post e nos comentários do post são **deletadas fisicamente (hard delete)** de forma imediata do banco.
4. Os registros físicos das mídias anexadas na tabela `media` são removidos.
5. Para evitar lentidão na resposta HTTP da requisição do usuário ao apagar arquivos grandes de storage, o backend delega a remoção física dos arquivos originais, preview e blur salvos no MinIO para o módulo de Jobs, gerando um job assíncrono do tipo `DELETE_S3_MEDIA` para fazer a limpeza de disco em background de forma assíncrona.
