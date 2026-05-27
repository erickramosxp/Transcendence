# Domínio: Media (Mídias e Armazenamento Polymorphic)

O domínio de **Media** centraliza a gestão de todos os arquivos de mídia (imagens, gifs e vídeos) carregados pelos usuários na plataforma Transcendence (Videa). Ele implementa um padrão de associação polimórfico flexível para vincular arquivos a qualquer outra entidade (posts, perfis, chats) sem acoplamento de chaves estrangeiras rígidas no banco de dados.

---

## 1. Estrutura do Pacote
Módulo transversal localizado em `com.ft.transcendence.media`, composto por:
- `domain`: A entidade principal `Media` que mapeia as localizações e metadados físicos.
- `app`: O serviço central `MediaService`.
- `dto`: O objeto de resposta padronizado `MediaResponse` (Java record).
- `enums`: Definições estritas de tipos (`MediaType`) e estados (`MediaStatus`).

---

## 2. Entidades

### `Media` (tabela: `media`)
Entidade genérica e polimórfica que armazena os caminhos dos arquivos salvos no bucket MinIO.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `modelType` | `String` | `model_type` | String identificadora da entidade dona (ex: `"POST"`, `"USER_PROFILE"`) |
| `modelId` | `Long` | `model_id` | Chave primária da entidade dona (ex: ID do post correspondente) |
| `mediaType` | `MediaType` (Enum) | `media_type` | Tipo físico do arquivo: `IMAGE` ou `VIDEO`. |
| `pathOriginal` | `String` | `path_original` | Caminho do arquivo original no MinIO (Object key). |
| `pathPreview` | `String` | `path_preview` | Caminho da versão otimizada de preview (ex: imagem redimensionada). |
| `pathBlur` | `String` | `path_blur` | Caminho da versão minúscula borrada usada para efeito blur-up no front. |
| `width` | `Integer` | `width` | Largura da mídia em pixels. |
| `height` | `Integer` | `height` | Altura da mídia em pixels. |
| `duration` | `BigDecimal` | `duration` | Duração do vídeo (segundos), escala 10, precisão 2. |
| `status` | `MediaStatus` (Enum) | `status` | Estado de processamento da mídia. |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de inserção gerada no banco. |

#### Enums de Domínio
- **`MediaType`**: `IMAGE`, `VIDEO`.
- **`MediaStatus`**:
  - `PENDING`: Mídia recém-recebida que requer processamento assíncrono em background (ex: compressão de vídeo).
  - `COMPLETED`: Mídia pronta e processada disponível para visualização no feed.
  - `FAILED`: Ocorreu uma falha grave na etapa de processamento ou validação.

---

## 3. Arquitetura Polymorphic Association (Morph)
Em vez de criar tabelas de junção separadas como `post_images`, `user_avatars`, etc., o sistema adota o padrão de **Associação Polimórfica (Morph)** baseado no par composto: `(modelType, modelId)`.

- Para recuperar as mídias anexadas a um post específico (ID 42):
  ```java
  List<Media> medias = Media.find("modelType = ?1 and modelId = ?2", "POST", 42).list();
  ```
Isso permite que qualquer nova funcionalidade da plataforma (ex: mensagens de chat com anexo, capas de grupo, etc.) utilize o sistema de mídias de forma imediata e transparente, sem a necessidade de criar novas tabelas SQL ou rodar migrations de DDL.

---

## 4. O Serviço Central (`MediaService`)

### Métodos Principais
- **`attachMedia(...)`**: Cria e persiste uma nova entidade `Media` com os caminhos originais, preview e blur associados ao modelo correto.
- **`attachExternalImage(modelType, modelId, externalUrl)`**: Associa de forma direta um link HTTP/HTTPS absoluto externo (ex: avatar retornado do login social do Google OAuth) ao banco de dados sem realizar o download ou upload local. O status é definido imediatamente como `COMPLETED`.
- **`buildMediaResponse(Media media)`**: Cria o DTO de resposta `MediaResponse` resolvendo de forma dinâmica as chaves físicas de armazenamento em URLs HTTP completas e acessíveis pelo browser via `StorageService`.

---

## 5. Regras de Resolução de URLs
A resolução de URLs de mídias (`resolvePublicUrl`) segue regras de contexto inteligentes e adaptativas para garantir portabilidade entre ambientes de Dev, Prod e integrações externas:

1. **URLs Absolutas Externas**: Se o caminho gravado iniciar com `http://` ou `https://`, ele é retornado sem qualquer alteração (caso clássico de avatares do Google).
2. **Caminhos Estáticos Locais**: Se o caminho iniciar com `/` (ex: `/videanews-avatar.png`), ele é prefixado com a URL configurada do frontend origin (`AppConfig.frontendOrigin()`).
3. **Caminhos Internos do Storage**: Caso contrário, o caminho é tratado como uma chave de objeto dentro do bucket MinIO e encaminhado para o `StorageService.generateUrl(path)` correspondente:
   - Em **Desenvolvimento**: O sistema gera um link HTTP estático simples e sem expiração apontando diretamente para a porta pública do MinIO (`publicMinioUrl/bucket/path`).
   - Em **Produção**: É gerada uma **URL Segura e Assinada (Presigned URL)** com expiração de **1 hora**, protegendo mídias sensíveis de scraping de links e acessos não-autorizados diretos.
