# Domínio: Feed (Posts, Comentários e Criação)

O módulo de **Feed** gerencia as interações sociais mais frequentes dos usuários: visualização de publicações, interações rápidas de curtidas e descurtidas, postagem de comentários e a criação de novos conteúdos multimídia.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/feed/`
- **Páginas de Rota**: `src/pages/Feed.jsx`

---

## 2. A Janela de Criação de Post (Modal e Upload Multimídia)
O frontend disponibiliza uma interface premium para publicação de conteúdo através do `CreatePostModal`:

1. **Upload de Mídia Flexível**:
   - Permite arrastar e soltar (drag and drop) ou selecionar arquivos de fotos, gifs e vídeos.
   - O arquivo é validado em tamanho localmente antes de iniciar o upload.
2. **Crop de Imagem Inteligente**:
   - Integra a biblioteca `react-easy-crop` permitindo que o usuário movimente, dê zoom e recorte o seu avatar ou imagem do post antes do envio, gerando uma experiência de rede social madura e profissional.
3. **Variantes de Imagem no Frontend**:
   - *Nota de Engenharia*: Quando o usuário escolhe enviar uma imagem, o frontend realiza o redimensionamento e compressão local das imagens usando a biblioteca `browser-image-compression` para gerar três arquivos: o arquivo original, a miniatura leve de visualização rápida (`previewFile`) e a versão minúscula borrada (`blurFile`). Os três arquivos são enviados simultaneamente no formulário multipart, minimizando latência no processamento e economizando CPU do servidor de banco.
4. **Link Previews**:
   - Se o usuário digitar um link HTTP no corpo do post, o frontend tenta obter e renderizar metadados de OpenGraph (imagem de capa, título e descrição do site) como preview de link interativo antes de enviar o post.

---

## 3. A Janela de Comentários e Thread
Ao clicar em "Comentar" em qualquer post, uma gaveta lateral ou seção interna é aberta:
- **Visualização Paginada**: Carrega a lista de comentários usando paginação sob demanda.
- **Micro-Likes em Comentários**: Cada comentário possui seu próprio botão de curtida individual integrado, com animações dinâmicas de transição ao clicar.
- **Emoji Picker Integrado**: O composer de comentário possui suporte a teclado rápido de emojis e bloqueio estrito de cliques duplos durante o processamento.

---

## 4. Otimizações de Performance Visuais
- **Pessimistic Update vs Optimistic UI**: 
  - Para ações de Curtir/Descurtir, o frontend adota a técnica de **Optimistic UI (Atualização Otimista)**: Ao clicar no botão de curtir, o estado visual do coração é pintado e o contador de likes é incrementado na UI de forma imediata. A requisição de rede HTTP corre em background. Se a requisição falhar (ex: queda de internet do usuário), o estado é revertido automaticamente com uma notificação suave de aviso na tela (Toast), gerando uma sensação de aplicação instantânea e ultra-veloz.
- **Progressive Blur Loading (Blur-up)**:
  - Para posts que contêm mídias pesadas de imagem, o frontend renderiza primeiro a imagem minúscula borrada (`pathBlur`) esticada em tamanho total. À medida que a imagem de alta definição original (`pathOriginal`) é baixada, o efeito de desfoque é removido via animação de transição suave (`blur-out`), evitando saltos secos de tela e melhorando a métrica do Core Web Vitals (CLS).
