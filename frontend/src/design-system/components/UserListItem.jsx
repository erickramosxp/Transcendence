/**
 *  aparece em Chat (lista de conversas), Amigos e Amigos Online na sidebar do Feed
 * 
 * <UserListItem
    variant="chat | friend | online"
    user={{ name, username, avatar }}
    meta={ timestamp ou badge de não lido }
    online={true}
    />
 */

import React from 'react'
import { AvatarWithStatus } from '@/design-system'

/**
 * Component for feed, sidebar and chat lists.
 * @param {Object} props
 * @param {Object} props.user - Basic user data
 * @param {Function} [props.onClick] - Action when clicking on the user (ex: opening chat)
 */
export function UserListItem({ user, onClick }) {
   return (
      <div
         onClick={onClick}
         className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      >
         <AvatarWithStatus
            name={user?.name}
            username={user?.username}
            src={user?.avatarUrl}
            status='online'
         />
         <div className="flex-1 overflow-hidden text-left">
            <p className="font-medium truncate leading-none">
               {user?.name}
            </p>
            <p className='text-sm text-muted-foreground'>
               @{user?.username}
            </p>
         </div>
      </div>
   )
}