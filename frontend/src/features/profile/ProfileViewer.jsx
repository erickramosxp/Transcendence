import React from 'react'
import { ProfileHeader } from './components/ProfileHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { yaleBlue } from "../../components/utils/colors";

export function ProfileViewer() {
  return (
    <div className={`${yaleBlue.bg.lightest} min-h-screen`}>
      <ProfileHeader />
      <div className='max-w-4xl mx-auto px-4 pb-10'>
        <Tabs defaultValue="posts" className={`max-w-4xl`} >
          <TabsList className='bg-[#f2f6fa]'>
            <TabsTrigger value="posts">
              Posts
            </TabsTrigger>
            <TabsTrigger value="media" className={''}>
              Mídia
            </TabsTrigger>
            <TabsTrigger value="likes" className={''}>
              Curtidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <h1>Posts</h1>
          </TabsContent>
          <TabsContent value="media">
            <h1>Mídia</h1>
          </TabsContent>
          <TabsContent value="likes">
            <h1>Likes</h1>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
