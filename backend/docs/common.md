# Módulo: Common (Infraestrutura e Utilitários Compartilhados)

O pacote `com.ft.transcendence.common` funciona como a base de sustentação do sistema backend. Ele centraliza recursos transversais (cross-cutting concerns) como armazenamento de objetos, monitoramento de métricas, segurança, validação de mídias, tratamento global de erros e utilitários JSON.

---

## 1. Estrutura do Pacote
Contém as seguintes divisões de infraestrutura:
- `config`: Configuração mapeada de propriedades da aplicação.
- `dto`: Modelos genéricos reutilizáveis (ex: paginação).
- `exception` e `errors`: Exceções de negócio personalizadas e tradutores JAX-RS para respostas HTTP estruturadas.
- `media`: Validação profunda de binários (imagem/vídeo) usando Apache Tika e FFprobe.
- `metrics`: Telemetria e coletores de dados do Prometheus via Micrometer.
- `security`: Resolução de contexto e identidade do usuário logado via JWT.
- `storage`: Driver cliente para uploads, downloads e deleções no MinIO.
- `utils`: Serviços de serialização/desserialização JSON e helpers de validação.

---

## 2. Configurações Globais (`common/config/`)
O arquivo `AppConfig.java` expõe propriedades com o prefixo `app` via `@ConfigMapping` do SmallRye Config:
- **`app.frontend-origin`**: Define a URL base do frontend (padrão: `http://localhost:5173`). Usada principalmente para prefixar links de imagem em dev e validações de origem CORS.

---

## 3. Paginação Padronizada (`common/dto/`)
Todas as rotas listadas do backend utilizam a classe genérica `PageResponse<T>` para responder coleções ao cliente:
- `items`: Lista contendo os registros da página atual.
- `page`: Número da página (0-indexed).
- `size`: Tamanho solicitado da página.
- `hasMore`: Flag booleana que indica se existem mais registros nas páginas subsequentes.

---

## 4. Tratamento Global de Erros (`common/exception/` e `common/errors/`)
O backend possui exceções customizadas de controle e tradutores (`ExceptionMapper`) anotados com `@Provider`. Eles capturam exceções e geram uma resposta JSON consistente no formato:

```json
{
  "code": "<CODIGO_DE_ERRO>",
  "message": "<Descrição explicativa do erro>"
}
```

### Mapeadores de Exceção
- `BadRequestMapper` $\to$ Captura `BadRequestException` $\to$ Status `400 BAD_REQUEST`
- `ForbiddenExceptionMapper` $\to$ Captura `ForbiddenException` $\to$ Status `403 FORBIDDEN`
- `IllegalArgumentExceptionMapper` $\to$ Captura `IllegalArgumentException` $\to$ Status `400 BAD_REQUEST`
- `IllegalStateExceptionMapper` $\to$ Captura `IllegalStateException` $\to$ Status `500 INTERNAL_SERVER_ERROR`
- `NotAuthorizedExceptionMapper` $\to$ Captura `NotAuthorizedException` $\to$ Status `401 NOT_AUTHORIZED`
- `NotFoundExceptionMapper` $\to$ Captura `NotFoundException` $\to$ Status `404 NOT_FOUND`
- `PayloadTooLargeMapper` $\to$ Captura `PayloadTooLargeException` (customizada) $\to$ Status `413 REQUEST_ENTITY_TOO_LARGE`
- `UnauthorizedExceptionMapper` $\to$ Captura `UnauthorizedException` (customizada) $\to$ Status `401 NOT_AUTHORIZED`
- `UnprocessableEntityMapper` $\to$ Captura `UnprocessableEntityException` (customizada) $\to$ Status `422 UNPROCESSABLE_ENTITY`

---

## 5. Validador de Arquivos (`common/media/`)
A classe `MediaValidationService` realiza validação técnica rigorosa dos arquivos enviados via multipart:
- **Tamanho Limite**:
  - Imagens: Máximo **5 MB**.
  - Vídeos: Máximo **20 MB**.
- **Formatos Aceitos**:
  - Imagens: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
  - Vídeos: `video/mp4`, `video/quicktime`.
- **MIME Detection**: Usa **Apache Tika** (`Tika.detect()`) para analisar a assinatura de bytes do arquivo (magic numbers), impedindo fraudes onde extensões são trocadas artificialmente (ex: renomear `.exe` para `.png`).
- **ffprobe Stream Analysis**: Spawna um subprocesso assíncrono do `ffprobe` com limite de 3 segundos para ler metadados do vídeo e garantir que ele contém streams legítimos de áudio/vídeo.
- **ImageIO Check**: Carrega as imagens via `ImageIO.read()` para garantir que a imagem não está corrompida.

---

## 6. Telemetria e Monitoramento (`common/metrics/`)
O Transcendence utiliza o Prometheus e o Grafana para telemetria em tempo real, orquestrados pela classe `SocialMetrics`.

### Métricas Principais Registradas
- **Conexões WebSocket**:
  - `social.ws.connections.active` (Gauge): Total de conexões abertas no momento.
  - `social.ws.connections.total` (Counter, tags: `opened`/`closed`): Total acumulado.
- **Autenticação**:
  - `social.auth.registrations.total` (Counter)
  - `social.auth.logins.total` (Counter, tag: `result=success`/`failed`)
  - `social.auth.google.logins.total` (Counter)
- **Engajamento**:
  - `social.posts.created.total` / `social.posts.deleted.total`
  - `social.likes.total` (Counter, tags: `target=post`/`comment`, `action=like`/`unlike`)
- **Mensageria e Rede**:
  - `social.chats.created.total` (Counter, tag: `type=direct`/`group`)
  - `social.messages.sent.total` (Counter, com flags de mídia e reply)
  - `social.friendships.total` (Counter, tags: `action=sent`/`accepted`/`rejected`/`removed`)

---

## 7. Segurança e Identidade (`common/security/`)
A classe `CurrentUser` encapsula o parse do token JWT fornecido pelo Quarkus JWT Security:
- `id()`: Extrai a claim `uid` do token. Possui suporte adaptativo para ler a claim se ela estiver codificada como número real, string ou número JSON, blindando o backend contra inconsistências no parser do token.
- `email()`: Retorna o subject/name do token (e-mail cadastrado).

---

## 8. Gerenciador de Armazenamento (`common/storage/`)
O `MinioStorageService` implementa a interface `StorageService` conectando-se a um servidor MinIO/S3 local ou em produção.

- **Configurações do MinIO**:
  - `minio.bucket-name`
  - `minio.access-key`
  - `minio.secret-key`
  - `minio.public-url`
- **Dual Clients**:
  - `minioClient`: Conecta-se no host de rede interna Docker (ex: `minio:9000`) para operações rápidas e seguras de upload/download dentro da subnet.
  - `publicMinioClient`: Conectado a partir da URL pública configurada. Utilizado especificamente para criar links assinados (`presignedUrls`) que serão legíveis pelo navegador do usuário externo.
- **URL Resolution**:
  - Em modo **Desenvolvimento** (se a URL pública for HTTP comum), retorna o link estático direto sem tempo de expiração para ganho de performance.
  - Em modo **Produção** (HTTPS), gera URLs assinadas e seguras com tempo de expiração padrão de **1 hora**.
- **Auto-criação de Bucket**: No evento de inicialização (`StartupEvent`), o serviço verifica se o bucket configurado existe e, caso não exista, realiza a sua criação com política padrão.
