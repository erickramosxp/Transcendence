import React, { useEffect, useRef, useState } from "react";
import { SquarePen, Settings } from 'lucide-react';
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from 'react-toastify'

import { CoverPhoto } from "@/features/profile/components/ui/CoverPhoto";
import { ProfileInfo } from "@/features/profile/components/ui/ProfileInfo";
import { EditProfileForm } from "@/features/profile/components/forms/EditProfileForm";
import { FollowersModal } from "@/features/profile/components/modals/FollowersModal";
import { followUser, unfollowUser } from "@/features/profile/services/profileService";
import { CroppedImage } from "@/features/profile/components/image/CroppedImage";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { ImageCropModal } from "@/features/profile/components/modals/ImageCropModal";


import { useTranslation } from "react-i18next";
import { SettingsContent } from "../SettingsContent";

import { Button, Modal, Avatar } from "@/design-system";

export const ProfileHeader = () => {

	const [connectionsModal, setConnectionsModal] = useState({ open: false, tab: 'followers' });

	const [editOpen, setEditOpen] = useState(false);
	const [newImage, setNewImage] = useState(null);
	const { userData, changeFields, changeFollowCount, updateAvatar } = useProfile();

	const [settingsOpen, setSettingsOpen] = useState(false);
	const { user } = useAuth();
	const { t } = useTranslation('profile');

	const handleFollowUser = async (username) => {

		try {
			await followUser(username);
			changeFields({ isFollowing: true });
			changeFollowCount('follow');
		} catch (err) {
			console.error(err);
			toast.error("Falha ao seguir")
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
			toast.error("Falha ao deixar de seguir")
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
	const isMobile = window.innerWidth < 768;


	return (
		<>
			<Modal
				open={editOpen}
				title={t('header.editProfile')}
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
							setNewImage={updateAvatar}
							onClose={setNewImage}
							cropShape="round"
							aspect={1 / 1}
						/>
					</ImageCropModal>
				}
				{!isMobile && settingsOpen && (
					<Modal
						open={settingsOpen}
						onClose={() => setSettingsOpen(false)}
						title={'Settings'}
					>
						<SettingsContent />
					</Modal>
				)}
				{isMobile && settingsOpen && (
					<div className="fixed inset-0 bg-background z-50">

						<div className="h-full flex flex-col">
							<div className="p-4 flex items-center justify-between border-b">
								<h2>Configurações</h2>
								<button onClick={() => setSettingsOpen(false)}>✕</button>
							</div>

							<div className="flex-1 overflow-y-auto">
								<SettingsContent />
							</div>
						</div>
					</div>
				)}

				<div className={`pb-5`}>
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
													{userData?.isFollowing ? t('header.unfollow') : t('header.follow')}
												</Button>
											)
											:
											<>
												<Button variant='outline' className="rounded-full cursor-pointer" onClick={() => setEditOpen(true)}>
													<SquarePen />
													{t('header.editProfile')}
												</Button>
												<Button variant='outline' className='rounded-full cursor-pointer' onClick={() => setSettingsOpen(true)}>
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
			</div>
		</>
		);
}
