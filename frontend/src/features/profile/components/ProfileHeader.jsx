import React, { useEffect, useRef, useState } from "react";
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
import { followUser, unfollowUser } from "../services/profileService";
import { CroppedImage } from "./CroppedImage";
import { useProfile } from "../hooks/ProfileContext";
import { ImageCropModal } from "./ImageCropModal";

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

export const ProfileHeader = () => {

	const [connectionsModal, setConnectionsModal] = useState({ open: false, tab: 'followers' });

	const [editOpen, setEditOpen] = useState(false);
	const [newImage, setNewImage] = useState(null);
	const { userData, changeFields, changeFollowCount } = useProfile();
	const { user } = useAuth();

	const handleFollowUser = async (username) => {

		try {
			await followUser(username);
			changeFields({ isFollowing: true });
			changeFollowCount('follow');
		} catch (err) {
			console.error(err)
		} finally {

		}
	}

	const handleUnfollowUser = async (username) => {

		try {
			await unfollowUser(username);
			changeFields({ isFollowing: false });
			changeFollowCount('unfollow');
		} catch (err) {
			console.error(err)
		} finally {

		}
	}

	const handleUserFollowrs = async (username, isFollowing) => {

		if (isFollowing) {
			await handleUnfollowUser(username);
		} else {
			await handleFollowUser(username);
		}

	}

	const updateImage = (event) => {

		const file = event.target.files[0];

		if (file) {
			// Cria uma URL temporária para o arquivo selecionado
			const imageUrl = URL.createObjectURL(file);
			setNewImage(imageUrl);
		}
		event.target.value = '';
	}

	const setNewUrlImage = (image) => {

		changeFields({ avatarUrl: image })
	}

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
					changeFields={changeFields}
				/>
			</Modal>
			<FollowersModal
				open={connectionsModal.open}
				onClose={closeConnections}
				defaultTab={connectionsModal.tab}
				userId={userData?.id}
				username={userData?.username}
				currentUserId={user?.id}
				changeFollowCount={changeFollowCount}
			/>
			<div className={`pb-5 relative`}>
				{newImage &&
					<ImageCropModal onClose={() => setNewImage(null)}>
						<CroppedImage 
								image={newImage}
								setNewImage={setNewUrlImage}
								onClose={setNewImage}
								cropShape="round"
								aspect={1 / 1}
							/>
					</ImageCropModal>
			// 		<div className="fixed inset-0 z-50
            // flex items-center justify-center p-1 sm:p-4
            // bg-back/40
            // backdrop-blur-sm" onClick={() => setNewImage(null)}>
			// 			<div className="fixed inset-x-1/12 inset-y-1/6 sm:inset-1/6 z-10" onClick={(e) => e.stopPropagation()}>
			// 				<CroppedImage 
			// 					image={newImage}
			// 					setNewImage={setNewUrlImage}
			// 					onClose={setNewImage}
			// 					cropShape="round"
			// 					aspect={1 / 1}
			// 				/>
			// 			<button
			// 				onClick={() => setNewImage(null)}
			// 				className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 cursor-pointer"
			// 			>
			// 				X
			// 			</button>
			// 			</div>
			// 		</div>
				}
				<div className="w-full max-w-4xl mx-auto">
					<CoverPhoto className='overflow-hidden'
						coverUrl={userData?.bannerImgUrl}
					/>

					<div className="px-4 pb-4 bg-card border-b border-border shadow-md rounded-b-md">

						<div className="flex justify-between items-start relative">

							<div className="-mt-16 rounded-full p-1 relative z-5 border-background bg-background">
								<label className="relative group">
									<Avatar
										size="xl3"
										id={userData?.userName}
										name={userData?.name}
										src={
											userData?.avatarUrl
										}
										className="group-hover:brightness-75"
									/>

									<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
										<span className="text text-xs font-bold bg-black/50 px-2 py-1 rounded">Trocar</span>
									</div>
									<input onChange={updateImage} className=" hidden" type="file" accept=".jpg, .png" />

								</label>

							</div>

							<div>
								<div className="flex justify-center items-center gap-2.5 mt-4">
									{user?.id != userData?.id ?
										(
											<Button variant='outline' className='cursor-pointer' onClick={() => handleUserFollowrs(userData.username, userData.isFollowing)}>
												{userData?.isFollowing ? 'Seguindo' : 'Seguir'}
											</Button>
										)
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
