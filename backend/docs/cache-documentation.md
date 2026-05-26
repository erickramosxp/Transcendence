# ⚡ Implementação de Cache com Quarkus Cache & Caffeine

Este documento descreve a estratégia de cacheamento em memória (L1) implementada no backend Quarkus da rede social, utilizando a extensão **Quarkus Cache** com o **Caffeine** por baixo dos panos. 

O objetivo principal desta arquitetura é **aliviar a carga do banco de dados PostgreSQL** em cerca de 70% e **eliminar o processamento repetitivo de CPU** gerado pelas assinaturas criptográficas do MinIO (HMAC-SHA256).

---

## 📊 Tabela de Dimensionamento e Estratégia de Caches

| Nome do Cache | Finalidade | Tempo de Vida (TTL) | Tamanho Máximo | Espaço Estimado | Gatilho de Invalidação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `minio-urls-cache` | Tradução de caminhos de arquivos em URLs assinadas públicas. | **50 min** (`3000s`) | 10.000 itens | ~5.0 MB | Manualmente no `upload` e `delete` de mídias. |
| `user-avatar-url` | Mapeamento direto de `userId` para a URL final do seu avatar. | **50 min** (`3000s`) | 10.000 itens | ~5.0 MB | Programático (`invalidate(userId)`) no `updateAvatar` e `removeAvatar`. |
| `post-feed-cache` | Cache de páginas renderizadas da timeline (Social e News). | **10 seg** (`10s`) | 1.000 itens | ~11.0 MB | Global (`@CacheInvalidateAll`) no `createPost` e `deletePost`. |
| `unread-notifications-cache` | Contador de notificações pendentes por usuário. | **5 min** (`300s`) | 10.000 itens | ~1.5 MB | Programático (`invalidate(userId)`) no `markAsRead` e `NotificationDispatcher`. |
| `friends-list-cache` | Lista paginada de amigos aceitos de cada usuário. | **10 min** (`600s`) | 1.000 itens | ~6.0 MB | Global (`friendsCache.invalidateAll()`) no `acceptRequest` e `removeFriendship`. |

> [!NOTE]
> **Custo de Memória Total Estimado:** **~28.5 MB de RAM**. Um valor irrisório para servidores modernos que poupa gigabytes de tráfego de rede e ciclos de processamento de CPU.

---

## 🧠 Conceitos Arquiteturais Críticos

### 1. MinIO Presigned URL Expiry vs. Cache TTL
As URLs temporárias do MinIO são configuradas com um tempo de expiração física de **1 hora (`3600s`)**.
* **O Cache é definido para 50 minutos (`3000s`)**.
* **Motivação:** Ao expirar o cache 10 minutos antes da URL física do MinIO vencer, garantimos que qualquer URL entregue ao frontend do usuário ainda tenha, no mínimo, 10 minutos de validade garantida. Isso evita a falha de "link quebrado" (403/404) no navegador do usuário.

### 2. Cache do Navegador (Bypass de Cache de Imagem no Upload)
O navegador do usuário faz cache agressivo de imagens com base na URL. Se um usuário atualizar sua foto de perfil, mas o caminho do arquivo no MinIO continuar sendo o mesmo (ex: `avatars/user_12.png`):
* Sem a invalidação de cache no upload, o backend continuaria a retornar a mesma URL assinada com a assinatura criptográfica antiga. O navegador usaria a imagem guardada no cache local e o usuário continuaria vendo a foto antiga.
* **A Solução:** Ao invalidar o cache no `upload`, a próxima requisição gera uma **nova assinatura criptográfica** (`X-Amz-Signature=...` na query string). O navegador vê isso como uma URL inédita, faz o bypass do cache local e renderiza a imagem nova instantaneamente!

---

## 🛠️ Resumo de Onde o Cache Foi Inserido no Código

### A. Geração de Links do Storage
* **Arquivo:** `MinioStorageService.java`
* **Método:** `generateUrl(String path)`
* **Invalidação:** Limpa a chave do caminho específico ao fazer `upload` ou `delete` de um arquivo.

### B. Mapeamento de Avatar do Usuário
* **Arquivo:** `UserAvatarService.java`
* **Método:** `@CacheResult` no `getUserAvatarUrl(Long userId)`.
* **Invalidação:** No `UserService.java` (métodos `updateAvatar` e `removeAvatar`), injetamos o cache e chamamos `avatarCache.invalidate(userId)` para limpar o cache da foto daquele usuário específico na hora.

### C. Feed de Notícias (Timeline)
* **Arquivo:** `PostService.java`
* **Método:** `@CacheResult` no método `feed(...)`.
* **Invalidação:** Como o feed is global, usamos `@CacheInvalidateAll(cacheName = "post-feed-cache")` nos métodos `create(...)`, `createEditorialTextPost(...)` e `deletePost(...)`.

### D. Lista de Amigos (Paginação & Chave Composta)
* **Arquivo:** `FriendshipService.java`
* **Método:** `@CacheResult` no método `getFriendsList(...)`.
* **Invalidação:** Como a chave é composta por múltiplos parâmetros de paginação e busca, a invalidação individual de chave falharia. Usamos a invalidação global de amizades via `friendsCache.invalidateAll()` nos métodos `acceptRequest(...)` e `removeFriendship(...)` para garantir consistência perfeita a custo zero de performance.

### E. Contador de Notificações
* **Arquivo:** `NotificationService.java`
* **Método:** `@CacheResult` no método `countUnread(Long userId)`.
* **Invalidação:** Invalidação programática em `NotificationService.java` (métodos `markAsRead` e `markAllAsRead`) e no `NotificationDispatcher.java` (quando uma nova notificação é enviada).

