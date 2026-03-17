import React from 'react'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system/primitives/Tabs'
import { MediaGrid } from '@/design-system/components/MediaGrid'
import PostList from '../feed/components/PostList';

const mockMedia = [
  { id: 1, url: "https://images.unsplash.com/photo-1504805572947-34fad45aed93", alt: "do something great" },
  { id: 2, url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", alt: "pessoas trabalhando" },
  { id: 3, url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", alt: "código no monitor" },
  { id: 4, url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", alt: "notebook aberto" },
  { id: 5, url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd", alt: "teclado mecânico" },
  { id: 6, url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", alt: "matrix code" },
  { id: 7, url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1", alt: "laptop cinza" },
];

export function ProfileViewer() {
  return (
    <div className={`bg-background min-h-screen`}>
      <ProfileHeader />
      <div className='max-w-4xl mx-auto px-4 pb-10'>
        <Tabs defaultValue="posts" className={`max-w-4xl`} >
          <TabsList className='mb-4'>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="likes">Curtidas</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {/* <PostList /> */}
            <h1>Posts</h1>
          </TabsContent>
          <TabsContent value="media">
            <MediaGrid  items={mockMedia}/>
          </TabsContent>
          <TabsContent value="likes">
            <h1>Likes</h1>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
