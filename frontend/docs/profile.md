# Domínio: Profile (Perfil do Usuário e Visualização Pública)

O módulo de **Profile** gerencia a visualização do perfil público de qualquer usuário cadastrado, a edição de biografias/links por parte do próprio dono da conta, e o manuseio gráfico sofisticado de uploads e recortes de banners e avatares.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/profile/`
- **Páginas de Rota**: `src/pages/Profile.jsx`

---

## 2. A Tela de Perfil Público (`Profile.jsx`)
A interface do perfil público simula as melhores práticas de redes sociais modernas com uma estrutura visual dividida em seções:

### A. Cabeçalho de Capa (Banner e Avatar)
- **Banner de Fundo**: Exibe a imagem de banner de alta definição configurada. Caso o perfil não possua banner, exibe um degradê gradiente sutil e agradável em tons de azul e roxo (glassmorphism look).
- **Avatar Flutuante**: O avatar do usuário flutua parcialmente sobreposto ao banner, com borda branca proeminente e efeito de sombra para realçar profundidade.
- **Botões de Ação Dinâmicos (Relation Status)**:
  - Se o perfil visualizado for a conta do próprio usuário logado $\to$ Exibe botão "Editar Perfil".
  - Se for de terceiros $\to$ O botão muda dinamicamente refletindo o status social exato: "Seguir"/"Deixar de seguir" e "Adicionar amigo" (ou "Solicitação enviada", "Aceitar convite", "Mensagem" se já forem amigos).

### B. Metadados e Informações do Perfil
- Exibe o Nome, `@username`, biografia resumida (máx 160 caracteres), localização física com ícone de pin no mapa e link do website pessoal formatado como link azul clicável.
- Exibe os contadores rápidos reativos de **Seguidores** e **Seguindo**. Clicar nesses contadores abre modais exibindo a lista completa de pessoas correspondentes com avatares.

### C. Navegação em Abas (Grid de Conteúdo)
A metade inferior da tela é gerenciada por abas:
- **Posts**: Renderiza a timeline contendo todos os posts já publicados por aquele usuário de forma cronológica decrescente.
- **Curtidos**: Renderiza a timeline de posts que ganharam curtida daquele usuário correspondente (respeitando privacidade se necessário).
- **Mídias (Grid)**: Renderiza um grid de fotos e vídeos limpo (sem textos e contadores visíveis), lembrando o portfólio visual do Instagram. Clicar em qualquer imagem abre o post detalhado em um lightbox de visualização premium.

---

## 3. Modal de Edição de Perfil e Crop de Mídia
Ao clicar em "Editar Perfil", um modal elegante é aberto:
1. **Edição Textual**: Inputs de texto para Nome (3-30 caracteres), Bio (máx 160), Localização (máx 100) e Link de Website (máx 100).
2. **Crop de Avatar reativo**:
   - Clicar na imagem de avatar do modal abre o seletor de arquivos.
   - Após selecionar a imagem local, abre-se uma tela integrada baseada em `react-easy-crop`.
   - O usuário pode arrastar o círculo de corte ou mover o slider de zoom de forma suave antes de confirmar.
   - O frontend processa o corte e gera as variantes de imagem localmente no navegador antes de realizar o upload via multipart para a rota `/user/avatar`, garantindo performance impecável.
3. **Edição de Banner**: Semelhante ao avatar, porém com proporção de corte horizontal retangular estrita (16:9 ou customizada) antes do envio.
