import api from "@/shared/api/httpClient";

export async function getUserInfo(username) {
  const response = await api.get(`/user/${username}`);
  return response.data;
}

export const mockPosts = {
  items: [
    {
      id: 1,
      name: "Ana Lima",
      userName: "analima",
      contents: "Acabei de finalizar um projeto incrível! 🚀",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      likedByMe: false,
      likeCount: 23,
      commentCount: 4,
      media: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400",
      created_at: "2026-03-20T14:30:00-03:00",
      fileType: "image"
    },
    {
      id: 2,
      name: "Ana Lima",
      userName: "analima",
      contents: "Alguém tem dica de biblioteca pra animações em React?",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      likedByMe: true,
      likeCount: 12,
      commentCount: 7,
      created_at: "2026-03-19T10:15:00-03:00"
    },
    {
      id: 3,
      name: "Ana Lima",
      userName: "analima",
      contents: "Tutorial de Tailwind CSS avançado",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      likedByMe: false,
      likeCount: 45,
      commentCount: 15,
      media: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
      created_at: "2026-03-18T16:45:00-03:00",
      fileType: "image"
    }
  ]
};

export async function getUserPosts(username, page, size) {
  await new Promise(r => setTimeout(r, 600)); // simula delay de rede
  return mockPosts;
  // const response = await api.get(`/user/${username}/posts`, {
  //   params: { page, size }
  // });
  // return response.data;
}

export const mockLikedPosts = {
  items:[
  {
    id: 4,
    name: "Carlos Dev",
    userName: "carlosdev",
    contents: "Nova versão do meu portfólio está no ar!",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    likedByMe: true,
    likeCount: 89,
    commentCount: 22,
    created_at: "2026-03-20T12:00:00-03:00"
  },
   {
    id: 4, name: "João Silva", userName: "joaosilva", contents: "Primeiro commit do meu app React + Quarkus!", avatarUrl: "https://i.pravatar.cc/150?img=4", likedByMe: true, likeCount: 67, commentCount: 23, media: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", created_at: "2026-03-20T10:20:00-03:00", fileType: "image"
  },
  {
    id: 5, name: "Maria Santos", userName: "mariasantos", contents: "Dica: useState + useCallback = performance!", avatarUrl: "https://i.pravatar.cc/150?img=5", likedByMe: false, likeCount: 12, commentCount: 8, created_at: "2026-03-20T09:45:00-03:00"
  },
  {
    id: 6, name: "Pedro Oliveira", userName: "pedrodev", contents: "Live coding: Docker + Quarkus deploy", avatarUrl: "https://i.pravatar.cc/150?img=6", likedByMe: true, likeCount: 89, commentCount: 34, media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400", created_at: "2026-03-19T21:30:00-03:00", fileType: "video"
  },
  {
    id: 7, name: "Carla Mendes", userName: "carlamendes", contents: "Design tokens no Tailwind > CSS variables", avatarUrl: "https://i.pravatar.cc/150?img=7", likedByMe: false, likeCount: 23, commentCount: 11, created_at: "2026-03-19T15:10:00-03:00"
  },
  {
    id: 8, name: "Rafael Costa", userName: "rafaelcosta", contents: "Quarkus vs Spring Boot: performance", avatarUrl: "https://i.pravatar.cc/150?img=8", likedByMe: true, likeCount: 156, commentCount: 67, media: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400", created_at: "2026-03-18T18:22:00-03:00", fileType: "image"
  },
  {
    id: 9, name: "Julia Ferreira", userName: "juliaf", contents: "Componentizando meu design system", avatarUrl: "https://i.pravatar.cc/150?img=9", likedByMe: false, likeCount: 8, commentCount: 3, created_at: "2026-03-18T11:05:00-03:00"
  },
  {
    id: 10, name: "Lucas Barbosa", userName: "lucasb", contents: "Git hooks salvam tempo no CI/CD", avatarUrl: "https://i.pravatar.cc/150?img=10", likedByMe: true, likeCount: 34, commentCount: 9, created_at: "2026-03-17T20:15:00-03:00"
  },
  {
    id: 11, name: "Beatriz Lima", userName: "beatrizlima", contents: "Hooks customizados que uso todo dia", avatarUrl: "https://i.pravatar.cc/150?img=11", likedByMe: false, likeCount: 19, commentCount: 6, created_at: "2026-03-17T14:33:00-03:00"
  },
  {
    id: 12, name: "Thiago Ramos", userName: "thiagoramos", contents: "Meu setup dev: VSCode + Docker + Tailwind", avatarUrl: "https://i.pravatar.cc/150?img=12", likedByMe: true, likeCount: 78, commentCount: 28, media: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400", created_at: "2026-03-16T17:50:00-03:00", fileType: "image"
  },
  {
    id: 13, name: "Fernanda Alves", userName: "fernandaalves", contents: "Por que escolhi Quarkus pro backend", avatarUrl: "https://i.pravatar.cc/150?img=13", likedByMe: false, likeCount: 41, commentCount: 14, created_at: "2026-03-16T12:40:00-03:00"
  },
  {
    id: 14, name: "Diego Souza", userName: "diegosouza", contents: "PR aberto! Review por favor 👀", avatarUrl: "https://i.pravatar.cc/150?img=14", likedByMe: true, likeCount: 56, commentCount: 19, created_at: "2026-03-15T22:10:00-03:00"
  },
  {
    id: 15, name: "Camila Duarte", userName: "camila_duarte", contents: "Tailwind + React = felicidade", avatarUrl: "https://i.pravatar.cc/150?img=15", likedByMe: false, likeCount: 27, commentCount: 10, created_at: "2026-03-15T09:25:00-03:00"
  },
  {
    id: 16, name: "Bruno Fernandes", userName: "brunof", contents: "API REST bem estruturada em Quarkus", avatarUrl: "https://i.pravatar.cc/150?img=16", likedByMe: true, likeCount: 102, commentCount: 39, media: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400", created_at: "2026-03-14T19:55:00-03:00", fileType: "image"
  },
  {
    id: 17, name: "Larissa Pinto", userName: "larissap", contents: "Debugging React performance", avatarUrl: "https://i.pravatar.cc/150?img=17", likedByMe: false, likeCount: 15, commentCount: 5, created_at: "2026-03-14T13:30:00-03:00"
  },
  {
    id: 18, name: "Gustavo Rocha", userName: "gustavorocha", contents: "Meu fluxo de deploy com GitHub Actions", avatarUrl: "https://i.pravatar.cc/150?img=18", likedByMe: true, likeCount: 63, commentCount: 21, created_at: "2026-03-13T16:08:00-03:00"
  }
]};

export async function getLikedPosts(username, page, size) {
  await new Promise(r => setTimeout(r, 600)); // simula delay de rede
  return mockLikedPosts;
  // const response = await api.get(`/user/${username}/liked`, {
  //   params: { page, size }
  // });
  // return response.data;
}

export async function updateProfileInfo(userInfos) {
  
  const response = await api.patch(`/user`, userInfos, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
  });
  return response.data;
}

const mockUsers = [
  { id: 1,  name: "Ana Lima",        username: "analima",     avatarUrl: "https://i.pravatar.cc/150?img=1",  isFollowing: true  },
  { id: 2,  name: "Carlos Dev",      username: "carlosdev",   avatarUrl: "https://i.pravatar.cc/150?img=2",  isFollowing: false },
  { id: 3,  name: "Julia Santos",    username: "julias",      avatarUrl: "https://i.pravatar.cc/150?img=3",  isFollowing: true  },
  { id: 4,  name: "Pedro Costa",     username: "pedrocosta",  avatarUrl: "https://i.pravatar.cc/150?img=4",  isFollowing: false },
  { id: 5,  name: "Mariana Fonseca", username: "marifonseca", avatarUrl: "https://i.pravatar.cc/150?img=5",  isFollowing: true  },
  { id: 6,  name: "Rafael Torres",   username: "rafaelt",     avatarUrl: "https://i.pravatar.cc/150?img=6",  isFollowing: false },
  { id: 7,  name: "Beatriz Nunes",   username: "bianunes",    avatarUrl: "https://i.pravatar.cc/150?img=7",  isFollowing: true  },
  { id: 8,  name: "Lucas Mendes",    username: "lucasm",      avatarUrl: "https://i.pravatar.cc/150?img=8",  isFollowing: false },
  { id: 9,  name: "Fernanda Rocha",  username: "feprocha",    avatarUrl: "https://i.pravatar.cc/150?img=9",  isFollowing: true  },
  { id: 10, name: "Diego Alves",     username: "diegoalves",  avatarUrl: "https://i.pravatar.cc/150?img=10", isFollowing: false },
  { id: 11, name: "Camila Duarte",   username: "camilad",     avatarUrl: "https://i.pravatar.cc/150?img=11", isFollowing: true  },
  { id: 12, name: "Thiago Braga",    username: "thiagob",     avatarUrl: "https://i.pravatar.cc/150?img=12", isFollowing: false },
  { id: 13, name: "Larissa Melo",    username: "larissamelo", avatarUrl: "https://i.pravatar.cc/150?img=13", isFollowing: true  },
  { id: 14, name: "Bruno Carvalho",  username: "brunoc",      avatarUrl: "https://i.pravatar.cc/150?img=14", isFollowing: false },
  { id: 15, name: "Isabela Freitas", username: "isafreitas",  avatarUrl: "https://i.pravatar.cc/150?img=15", isFollowing: true  },
  { id: 16, name: "Gustavo Lima",    username: "gustavolima", avatarUrl: "https://i.pravatar.cc/150?img=16", isFollowing: false },
  { id: 17, name: "Natália Pinto",   username: "nataliap",    avatarUrl: "https://i.pravatar.cc/150?img=17", isFollowing: true  },
  { id: 18, name: "Vinícius Cruz",   username: "vinicruz",    avatarUrl: "https://i.pravatar.cc/150?img=18", isFollowing: false },
  { id: 19, name: "Amanda Borges",   username: "amandab",     avatarUrl: "https://i.pravatar.cc/150?img=19", isFollowing: true  },
  { id: 20, name: "Rodrigo Souza",   username: "rodrigos",    avatarUrl: "https://i.pravatar.cc/150?img=20", isFollowing: false },
  { id: 21, name: "Priscila Gomes",  username: "priscigomes", avatarUrl: "https://i.pravatar.cc/150?img=21", isFollowing: true  },
  { id: 22, name: "Eduardo Leal",    username: "eduardol",    avatarUrl: "https://i.pravatar.cc/150?img=22", isFollowing: false },
  { id: 23, name: "Tatiane Ribeiro", username: "tatiribeiro", avatarUrl: "https://i.pravatar.cc/150?img=23", isFollowing: true  },
  { id: 24, name: "Henrique Dias",   username: "henriquedias",avatarUrl: "https://i.pravatar.cc/150?img=24", isFollowing: false },
];



export async function getFollowingList(username, page, size) {

  await new Promise(r => setTimeout(r, 600)); // simula delay de rede
  return mockUsers;
  // const response = await api.get(`/user/${username}/following`, {
  //   params: { page, size }
  // });
  // return response.data;
}


const mockMedia = {
  items: [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
    alt: "do something great",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Do something great! 🚀",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: false,
    likes: 42,
    countComments: 5,
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    alt: "pessoas trabalhando",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Pessoas incríveis constroem coisas incríveis 💻",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: true,
    likes: 18,
    countComments: 2,
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    alt: "código no monitor",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Código limpo é poesia. ✨",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: false,
    likes: 30,
    countComments: 4,
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    alt: "notebook aberto",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Mais um dia de muito café e código ☕",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: true,
    likes: 55,
    countComments: 8,
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
    alt: "teclado mecânico",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Novo teclado mecânico! Produtividade no máximo 🎹",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: false,
    likes: 77,
    countComments: 11,
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    alt: "matrix code",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Às vezes me sinto dentro do Matrix 🟩",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: true,
    likes: 90,
    countComments: 14,
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    alt: "laptop cinza",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Setup minimalista. Menos é mais. 🖥️",
    date_time: "2022-03-10T12:15:50-04:00",
    isLiked: false,
    likes: 63,
    countComments: 9,
  },
] 
};

export async function getUserMediaPosts(username, page, size) {

  await new Promise(r => setTimeout(r, 600)); // simula delay de rede
  return mockMedia;
  // const response = await api.get(`/user/${username}/media`, {
  //   params: { page, size }
  // });
  // return response.data;
}

export async function getFollowersList(username, page, size) {

  await new Promise(r => setTimeout(r, 600));
  return mockUsers.slice(0, 10); // retorna menos pra parecer diferente

  // const response = await api.get(`/user/${username}/followers`, {
  //   params: { page, size }
  // });
  // return response.data;
}

export async function followUser(username) {

  // const response = await api.post(`/user/${username}/follow`);
  // return response.data;
}

export async function unfollowUser(username) {

  // const response = await api.post(`/user/${username}/unfollow`);
  // return response.data;
}