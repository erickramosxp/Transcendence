import React, { useState } from "react";
import { SquarePen, Settings } from 'lucide-react';
import { toast } from 'react-toastify' 

// import { Avatar } from "./Avatar";
import { CoverPhoto } from "./CoverPhoto";
import { ProfileInfo } from "./ProfileInfo";
import { EditProfileForm } from "./EditProfileForm";
import { FollowersModal } from "./FollowersModal";
import { Button } from "@/design-system/primitives/Button";
import { Modal } from "@/design-system/components/Modal";
import { useAuth } from "@/app/providers/AuthProvider";
import { Avatar } from "@/design-system/primitives/Avatar";

const userData = {
	name: "Morty",
	username: "morty",
	bio: "Apaixonado por tecnologia e inovação 💻",

	location: "São Paulo, Brasil",
	website: "example.com",
	joinDate: "Janeiro 2024",

	followers: "1.2k",
	following: "256",
	// Teste colocar uma URL de imagem aqui depois, ex: "https://images.unsplash.com/photo-1504805572947-34fad45aed93"
	coverUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
	// "https://github.com/shadcn.png"
	avatarUrl: "https://github.com/shadcn.png",
};

// {
//   "id": 0,
//   "avatarUrl": "string",
//   "bannerImgUrl": "string",
//   "username": "string",
//   "name": "string",
//   "followers": 0,
//   "following": 0,
//   "registerDate": "2022-03-10T12:15:50-04:00"
// }

export const ProfileHeader = ({userData}) => {
  
	const [connectionsModal, setConnectionsModal] = useState({ open: false, tab: 'followers' });

	const [editOpen, setEditOpen] = useState(false);
	const { user } = useAuth();


	const openFollowers = () => setConnectionsModal({ open: true, tab: 'followers' });
	const openFollowing = () => setConnectionsModal({ open: true, tab: 'following' });
	const closeConnections = () => setConnectionsModal({ open: false, tab: 'followers' });


  return (
	<>
		<Modal 
			open={editOpen}
			title="Editar Perfil"
			onClose={() => setEditOpen(false)}
			scrollable={false}
		>
			<EditProfileForm 
				onCancel={() => setEditOpen(false)}
				onSaved={() => setEditOpen(false)}
				userData={userData}
			/>
		</Modal>
		<FollowersModal
		open={connectionsModal.open}
		onClose={closeConnections}
		defaultTab={connectionsModal.tab}
		userId={userData?.id}
		currentUserId={user?.id}
		/>
  	<div className={`pb-5`}>
		<div className="w-full max-w-4xl mx-auto">
			<CoverPhoto className='overflow-hidden'
				coverUrl={userData?.bannerImgUrl}
			/> 

			<div className="px-4 pb-4 bg-card border-b border-border shadow-md rounded-b-md">

				<div className="flex justify-between items-start relative">

					<div className="-mt-16 rounded-full p-1 relative z-10 border-background bg-background"> 

						<Avatar
							size="xxl"
							name={userData?.name}
							src={
							userData?.avatarUrl
							}
						/>

					</div>

					<div>
						<div className="flex justify-center items-center gap-2.5 mt-4">
							{user?.id != userData?.id ?
								<Button variant='outline' className='cursor-pointer'>
									Seguir
								</Button>
								:
								<>
									<Button variant='outline' className="rounded-full cursor-pointer" onClick={() => setEditOpen(true)}>
										<SquarePen />
										Editar Perfil
									</Button>
									<Button variant='outline' className='rounded-full cursor-pointer'>
										<Settings />
									</Button>
								</>
							}
						</div>
					</div>
				</div>
			<ProfileInfo  
				{...userData}
				onFollowersClick={openFollowers}
				onFollowingClick={openFollowing}
				/>
			</div>
		</div>
    </div>
	</>
  );
};
