// components/FollowersModal.jsx
import { useEffect, useState } from 'react';
import { Modal } from '@/design-system/components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system/primitives/Tabs';
import { getFollowersList, getFollowingList } from '../services/profileService';
import { Button } from '@/design-system/primitives/Button';
import { Avatar } from '@/design-system/primitives/Avatar';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Scroll from '@/design-system/primitives/Scroll';

function UserList({ users, loading, currentUserId, onClose }) {

  const navigate = useNavigate();

  function handleNavigate(username) {
    onClose?.();                          
    navigate(`/profile/${username}`); 
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 rounded-full border-2
                        border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!users.length) {
    return (
      <p className="text-center text-muted-foreground py-10 text-sm">
        Nenhum resultado ainda.
      </p>
    );
  }

  return (
    <Scroll className="divide-y divide-border max-h-[50vh] overflow-y-auto">
      {users.map((user, index) => (
        <span
          key={`${user.id}-${index}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
        >
          <Avatar 
            src={user.avatarUrl ?? '/default-avatar.png'}
            alt={user.name}
            username={user.username}
            size='md'
          />
          {/* <img
            
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-border shrink-0"
          /> */}
          <div className="flex flex-col flex-1 min-w-0">
            <Link
              to={`/profile/${user.username}`}
              onClick={() => handleNavigate(user.username)}
              className="text-sm font-medium text-foreground
                         hover:text-primary transition-colors truncate"
            >
              {user.name}
            </Link>
            <span className="text-xs text-muted-foreground truncate">
              @{user.username}
            </span>
          </div>

          {user.id !== currentUserId && (
            <Button
              variant={user.isFollowing ? "secondary" : "primary"}
              size="follow"
              // onClick={handleFollow}
            >
              {user.isFollowing ? 'Seguindo' : 'Seguir'}
            </Button>
          )}
        </span>
      ))}
    </Scroll>
  );
}

export function FollowersModal({ open, onClose, defaultTab = 'followers', userId, currentUserId }) {

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowing, setLoadingFollowing] = useState(false);

    useEffect(() => {
        if (!open || !userId) return;

        const fetchFollowers = async () => {
        setLoadingFollowers(true);
        try {
            const res  = await getFollowersList(userId);
            setFollowers(res);
        } finally {
            setLoadingFollowers(false);
        }
    };

    const fetchFollowing = async () => {

        setLoadingFollowing(true);
        try {
            const res  = await getFollowingList(userId);
            setFollowing(res);
        } finally {
            setLoadingFollowing(false);
        }
    };

    // Busca os dois em paralelo ao abrir
    fetchFollowers();
    fetchFollowing();
    }, [open, userId]);

    return (
        <Modal open={open} onClose={onClose} title="Conexões" size="md" scrollable={false}>
        <Tabs defaultValue={defaultTab} className="-mt-2">
            <TabsList className="w-full mb-2">
            <TabsTrigger value="following" className="flex-1">
                Seguindo
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">
                Seguidores
            </TabsTrigger>
            </TabsList>

            <TabsContent value="following">
            <UserList
                users={following}
                loading={loadingFollowing}
                currentUserId={currentUserId}
                onClose={onClose}
            />
            </TabsContent>
            <TabsContent value="followers">
            <UserList
                users={followers}
                loading={loadingFollowers}
                currentUserId={currentUserId}
                onClose={onClose}
            />
            </TabsContent>

        </Tabs>
        </Modal>
    );
}
