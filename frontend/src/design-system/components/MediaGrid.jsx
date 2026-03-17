import { useState } from "react";
import { Modal } from "@/design-system/components/Modal";
import  PostCard  from "@/features/feed/components/PostCard";

const mockMedia = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
    alt: "do something great",
    author: { name: "Morty", username: "morty", avatar: "https://github.com/shadcn.png" },
    content: "Do something great! 🚀",
    date_time: "há 2 horas",
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
    date_time: "há 1 dia",
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
    date_time: "há 3 dias",
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
    date_time: "há 4 dias",
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
    date_time: "há 5 dias",
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
    date_time: "há 1 semana",
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
    date_time: "há 2 semanas",
    isLiked: false,
    likes: 63,
    countComments: 9,
  },
];


export function MediaGrid({ items = [] }) {

  const [selected, setSelected] = useState(null);

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">
        Nenhuma mídia ainda.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelected(mockMedia.find((p) => p.id === item.id))}
          >
            <img
              src={item.url}
              alt={item.alt ?? "mídia"}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <Modal
        size="lg"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <PostCard 
          className="!p-0 !shadow-none !border-none !rounded-none -mt-8"
          post={{
            id: selected.id,
            userPhoto: selected.author.avatar,
            name: selected.author.name,
            username: selected.author.username,
            date_time: selected.date_time,
            content: selected.content,
            imageUrl: selected.url,
            isLiked: selected.isLiked,
            likes: selected.likes,
            countComments: selected.countComments,
          }}
          />
        )}
      </Modal>
    </>
  );
}
