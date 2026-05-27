# Domínio: Settings (Configurações e Preferências de Tema/Idioma)

O módulo de **Settings** permite aos usuários configurar suas preferências visuais e regionais de forma persistente. Ele gerencia as escolhas de tema gráfico (como o modo escuro) e idioma padrão do frontend, sincronizando essas preferências em tempo real com a API do backend.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/settings/`
- **Páginas de Rota**: Acessível a partir de modais de configuração ou pelo menu suspenso do cabeçalho global.

---

## 2. Gerenciamento e Aplicação de Temas Gráficos (Dark Mode)
A escolha do tema visual é aplicada diretamente no DOM principal para consistência em toda a aplicação:

- **Estratégia de Classe no Documento**:
  - Quando a store detecta a mudança de tema para `"dark"`, ela adiciona a classe `dark` na tag raiz `<html>` do documento e salva a escolha no `localStorage`.
  - O Tailwind CSS v4 detecta a classe `dark` no documento e aciona reativamente a variação de cores declaradas com o prefixo `dark:`.
- **Sincronização em Tempo Real**:
  - A alteração do tema no painel de configurações dispara de forma assíncrona um request `PATCH /preferences/theme`. Isso assegura que, se o usuário logar em outro computador ou dispositivo móvel no futuro, suas preferências visuais sejam mantidas de forma idêntica.
  - A mudança visual ocorre com uma transição CSS suave de cores (`transition-colors duration-300`) em todas as tags para evitar flashes brancos agressivos aos olhos.

---

## 3. Gestão e Troca de Idiomas (i18n)
O suporte multilíngue do frontend do Transcendence é implementado usando as bibliotecas **`i18next`** e **`react-i18next`**:

1. **Arquivos de Tradução (Locales)**:
   - As traduções das strings textuais estão organizadas em diretórios de locales dentro de `src/i18n/locales/` (ex: `pt-BR`, `en-US`, `es-ES`).
   - Cada idioma possui arquivos JSON contendo pares de chave-valor estruturados correspondendo a seções da aplicação (ex: `chat.json`, `feed.json`, `auth.json`).
2. **Troca Dinâmica**:
   - Clicar nas bandeiras ou seletores de idioma altera a instância global da biblioteca: `i18n.changeLanguage(newLang)`.
   - Toda a interface é re-traduzida em tempo real de forma instantânea sem necessidade de recarregar a tela (Hot Reloading de i18n).
3. **Persistência e Sincronização**:
   - Semelhante ao tema, a troca de idioma no seletor salva o locale localmente no `localStorage` e dispara `PATCH /preferences/language` ao servidor.

---

## 4. O Painel de Preferências (UI/UX)
O seletor visual de configurações é renderizado em um painel elegante utilizando cartões interativos (Interactive Cards):
- **Cards de Seleção Visual**: Em vez de caixas de seleção (selects) tradicionais e sem graça, a escolha do tema exibe cartões gráficos ilustrados simulando layouts de "Modo Claro" e "Modo Escuro". Clicar nos cartões aplica e visualiza o tema em tempo real antes mesmo do clique de confirmação.
- **Seletor de Idioma**: Exibe os idiomas com seus nomes nativos (ex: "Português", "English", "Español") acompanhados de ícones minimalistas e legíveis.
