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
import { followUser, unfollowUser } from "../services/profileService";
import { useTranslation } from 'react-i18next';

function UserList({ users, loading, currentUserId, onClose, toggleFollow, changeFollowCount }) {

  const navigate = useNavigate();

  function handleNavigate(username) {
    onClose?.();                          
    navigate(`/profile/${username}`); 
  }

    const handleFollowUser = async (username) => {

    try {
      await followUser(username);
      toggleFollow(username);
      changeFollowCount('follow');
    } catch (err) {
      console.error(err)
    } finally {

    }
  }

  const handleUnfollowUser = async (username) => {
    
    try {
      await unfollowUser(username);
      toggleFollow(username);
      changeFollowCount('unfollow');
    } catch (err) {
      console.error(err)
    } finally {

    }
  }

  const handleUserFollowrs =  async (username, isFollowing) => {

    if (isFollowing) {
      await handleUnfollowUser(username);
    } else {
      await handleFollowUser(username);
    }

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
          <button onClick={() => onClose?.()}>
            <Avatar 
              src={user?.avatarUrl ?? null}
              alt={user.name}
              name={user.name}
              username={user.username}
              size='md'
            />
          </button>
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

          {user?.isFollowing &&
          <>
            {
              user.id !== currentUserId && (
                <Button
                  variant={user.isFollowing ? "secondary" : "primary"}
                  size="follow"
                  onClick={() => handleUserFollowrs(user.username, user.isFollowing)}
                >
                  {user.isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
              )
            }
          </>
          } 
        </span>
      ))}
    </Scroll>
  );
}

export function FollowersModal({ open, onClose, defaultTab = 'followers', userId, currentUserId, username, changeFollowCount }) {

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowing, setLoadingFollowing] = useState(false);
    const { t } = useTranslation('profile');

    useEffect(() => {
        if (!open || !userId) return;

        const fetchFollowers = async () => {
        setLoadingFollowers(true);
        try {
            const res  = await getFollowersList(username);
            setFollowers(res.items);
        } finally {
            setLoadingFollowers(false);
        }
    };

    const fetchFollowing = async () => {

        setLoadingFollowing(true);
        try {
            const res  = await getFollowingList(username);
            setFollowing(res.items);
        } finally {
            setLoadingFollowing(false);
        }
    };

    // Busca os dois em paralelo ao abrir
    fetchFollowers();
    fetchFollowing();
    }, [open, username]);

    const toggleFollow = (username) => {
      setFollowers((prevFollowers) => {
        const updated = prevFollowers.map((user) =>
          user.username === username
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        );

        const targetUser = updated.find((u) => u.username === username);

        setFollowing((prevFollowing) => {
          if (targetUser.isFollowing) {
            return [...prevFollowing, targetUser];
          } else {
            return prevFollowing.filter((u) => u.username !== username);
          }
        });

        return updated;
      });
    };

    return (
        <Modal open={open} onClose={onClose} title={t('info.followersModal.title')} size="md" scrollable={false}>
        <Tabs defaultValue={defaultTab} className="-mt-2">
            <TabsList className="w-full mb-2">
            <TabsTrigger value="following" className="flex-1">
                {t('info.following')}
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">
                {t('info.followers')}
            </TabsTrigger>
            </TabsList>

            <TabsContent value="following">
            <UserList
                users={following}
                loading={loadingFollowing}
                currentUserId={currentUserId}
                onClose={onClose}
                toggleFollow={toggleFollow}
                changeFollowCount={changeFollowCount}
            />
            </TabsContent>
            <TabsContent value="followers">
            <UserList
                users={followers}
                loading={loadingFollowers}
                currentUserId={currentUserId}
                onClose={onClose}
                toggleFollow={toggleFollow}
                changeFollowCount={changeFollowCount}
            />
            </TabsContent>

        </Tabs>
        </Modal>
    );
}
