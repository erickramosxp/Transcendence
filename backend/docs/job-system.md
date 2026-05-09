# Job System

Este documento descreve o sistema de jobs assíncronos do backend do Transcendence.

O objetivo é processar tarefas demoradas ou desacopladas do fluxo principal da aplicação, como remoção de mídia após soft delete de post e, futuramente, compressão de vídeo e geração de thumbnail.

## Objetivo

O sistema de jobs existe para:

- Executar tarefas assíncronas sem bloquear a requisição principal.
- Manter a operação principal consistente mesmo quando o processamento externo falhar.
- Permitir retries com backoff.
- Registrar falhas e estado de processamento.
- Facilitar a adição de novos jobs no futuro.

## Estrutura

A feature `job` segue a organização por feature usada no backend:

- `domain`: entidade principal `Job`.
- `enums`: tipos e estados do job.
- `app`: serviços de criação, processamento e worker.
- `handlers`: lógica específica de cada tipo de job.
- `JobPayloads`: classes com os dados serializados de cada job.

### Estrutura atual

```text
job/
├── JobPayloads/
│   ├── DeletePostMediaPayload.java
│   └── ProcessVideoPayload.java
├── app/
│   ├── JobProcessor.java
│   ├── JobService.java
│   └── JobWorker.java
├── domain/
│   └── Job.java
├── enums/
│   ├── JobStatus.java
│   └── JobType.java
└── handlers/
    ├── DeletePostMediaHandler.java
    └── ProcessVideoHandler.java
```

## Tabela `jobs`

A tabela `jobs` armazena o estado de cada processamento assíncrono.

```sql
CREATE TABLE jobs (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payload TEXT NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    last_error TEXT,
    available_at timestamptz NOT NULL DEFAULT NOW(),
    processing_started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz
);

CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_jobs_fetch ON jobs(status, available_at, created_at);
```

### Significado dos campos

- `id`: identificador do job.
- `type`: tipo do job, por exemplo `DELETE_POST_MEDIA` ou `PROCESS_VIDEO`.
- `status`: estado atual do job.
- `payload`: JSON serializado com os dados necessários para execução.
- `attempts`: quantidade de falhas/retries já executados.
- `max_attempts`: limite máximo de tentativas.
- `last_error`: último erro ocorrido.
- `available_at`: momento em que o job pode ser executado novamente.
- `processing_started_at`: instante em que o worker começou a processar.
- `finished_at`: instante em que o job foi finalizado.
- `created_at`: momento da criação do job.
- `updated_at`: última alteração da linha.

## Estados do job

Os estados possíveis são:

- `PENDING`: job aguardando execução.
- `PROCESSING`: job foi assumido pelo worker.
- `DONE`: job concluído com sucesso.
- `FAILED`: job falhou definitivamente após atingir o limite de tentativas.

## Fluxo geral

### 1. Criação do job

O job é criado dentro do fluxo principal da aplicação, geralmente dentro de uma transação do caso de uso.

Exemplo atual: ao fazer soft delete de um post com mídia, o backend cria um job para remover essa mídia do storage.

### 2. Worker busca jobs disponíveis

O `JobWorker` roda periodicamente e busca jobs com:

- `status = PENDING`
- `available_at <= now()`

Isso evita processar jobs antes da hora e permite retry com backoff.

### 3. Processor direciona o job

O `JobProcessor` lê o `type` do job e direciona para o handler correto.

### 4. Handler executa a regra específica

Cada handler contém a lógica específica daquele tipo de job.

### 5. Atualização de estado

Após o processamento:

- sucesso: `DONE`, `finished_at` preenchido.
- falha transitória: incrementa `attempts`, atualiza `last_error`, recalcula `available_at`, volta para `PENDING`.
- falha final: `FAILED`, `finished_at` preenchido.

## Tipos de job

### DELETE_POST_MEDIA

Responsável por apagar a mídia de um post após soft delete.

Payload atual:

```java
public class DeletePostMediaPayload {
    public Long postId;
    public String mediaUrl;
    public Long requestedByUserId;
}
```

Fluxo:

1. Buscar o post.
2. Ler `mediaUrl`.
3. Apagar o arquivo no storage.
4. Se o post ainda apontar para essa mídia, limpar `post.mediaUrl`.

### PROCESS_VIDEO

Tipo futuro para processamento de vídeo após upload.

Objetivos futuros:

- comprimir o vídeo;
- substituir o arquivo original pelo processado;
- gerar thumbnail;
- atualizar a mídia final no banco.

Payload atual planejado:

```java
public class ProcessVideoPayload {
    public Long postId;
    public Long mediaId;
    public String path;
    public String sourceContentType;
    public Long requestedByUserId;
}
```

## Serialização do payload

Os payloads são serializados em JSON antes de serem salvos no banco.

A classe `JsonService` é responsável por isso:

```java
@ApplicationScoped
public class JsonService {

    @Inject
    ObjectMapper mapper;

    public String serialize(Object payload) {
        try {
            return mapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Error serializing payload", e);
        }
    }

    public <T> T deserialize(String json, Class<T> clazz) {
        try {
            return mapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Error deserializing payload", e);
        }
    }
}
```

## Responsabilidades por classe

### `JobService`

Cria jobs a partir de ações do domínio.

Exemplo atual: criar um job de deleção de mídia quando um post é soft deleted.

### `JobWorker`

Executa periodicamente a busca por jobs pendentes e chama o `JobProcessor`.

### `JobProcessor`

Faz o despacho por tipo de job e desserializa o payload correto.

### `DeletePostMediaHandler`

Executa a remoção da mídia do storage e a limpeza da referência no post.

### `ProcessVideoHandler`

Handler futuro para compressão de vídeo e geração de thumbnail.

## Regras importantes

- O handler deve focar na regra do tipo específico.
- O worker deve controlar status, tentativas e timestamps.
- O payload deve conter somente os dados necessários para execução.
- `attempts` deve ser incrementado apenas em falhas.
- `available_at` controla quando o job pode ser tentado novamente.
- Jobs devem ser idempotentes sempre que possível.

## Exemplo do caso atual

Fluxo de exclusão de mídia:

1. Usuário faz delete de post.
2. O post entra em soft delete.
3. O `JobService` cria um job `DELETE_POST_MEDIA`.
4. O `JobWorker` pega o job quando ele estiver disponível.
5. O `JobProcessor` direciona para `DeletePostMediaHandler`.
6. O handler remove a mídia do storage.
7. Se a mídia ainda estiver associada ao post, o campo `mediaUrl` é limpo.
8. O job é marcado como `DONE`.

## Exemplo de registro no banco

### Job recém-criado

```sql
id: 101
type: DELETE_POST_MEDIA
status: PENDING
payload: {"postId":42,"mediaUrl":"user/1/post/...","requestedByUserId":7}
attempts: 0
max_attempts: 5
last_error: null
available_at: 2026-05-07 09:50:00-03
processing_started_at: null
finished_at: null
created_at: 2026-05-07 09:50:00-03
updated_at: 2026-05-07 09:50:00-03
```

### Job em processamento

```sql
status: PROCESSING
processing_started_at: 2026-05-07 09:50:10-03
updated_at: 2026-05-07 09:50:10-03
```

### Job com falha temporária

```sql
status: PENDING
attempts: 1
last_error: "RuntimeException: error deleting media"
available_at: 2026-05-07 09:51:00-03
updated_at: 2026-05-07 09:50:10-03
```

### Job concluído

```sql
status: DONE
finished_at: 2026-05-07 09:50:12-03
updated_at: 2026-05-07 09:50:12-03
```

## Evolução futura

Esse sistema foi criado para ser expandido.

Novos tipos de job podem incluir:

- `PROCESS_VIDEO`
- `GENERATE_PREVIEW`

Cada novo tipo deve ter:

- um valor no enum `JobType`;
- um payload próprio;
- um handler específico;
- a lógica de despacho no `JobProcessor`.

## Observações finais

A feature `job` é uma feature transversal do backend. Ela não pertence apenas ao `post`, mas atende processos assíncronos de várias partes do sistema.

Por isso, ela segue a arquitetura por feature do projeto, mas com responsabilidade de infraestrutura de domínio.
