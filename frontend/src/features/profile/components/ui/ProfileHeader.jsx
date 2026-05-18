import React, { useState } from "react";
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
import { SettingsContent } from "@/features/settings/components/SettingsContent";

import { Button, Loading, Modal } from "@/design-system";
import { AvatarEditable } from "./AvatarEditable";
import { validImageFile, validateImageContent } from "../../utils/validFile";
import FriendshipButton from "@/features/friends/components/FriendshipButton";

export const ProfileHeader = () => {

	const [connectionsModal, setConnectionsModal] = useState({ open: false, tab: 'followers' });

	const [editOpen, setEditOpen] = useState(false);
	const [newImage, setNewImage] = useState(null);
	const [disableFollowButton, setDisableFollowButton] = useState(false);
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
			toast.error(t("header.toast.follow_error"))
		}
	}

	const handleUnfollowUser = async (username) => {

		try {
			await unfollowUser(username);
			changeFields({ isFollowing: false });
			changeFollowCount('unfollow');
		} catch (err) {
			toast.error(t("header.toast.unfollow_error"))
		}
	}

	const handleUserFollowrs = async (username, isFollowing) => {

		setDisableFollowButton(true);
		if (isFollowing) {
			await handleUnfollowUser(username);
		} else {
			await handleFollowUser(username);
		}
		setDisableFollowButton(false);

	}

	const updateImage = async (file) => {

		const typeValidation = validImageFile(file, "avatar");
		if (!typeValidation.valid) {
			toast.error(typeValidation.error);
			return;
		}

		const contentValidation = await validateImageContent(file);
		if (!contentValidation.valid) {
			toast.error(contentValidation.error);
			return;
		}

		const imageUrl = URL.createObjectURL(file);
		setNewImage(imageUrl);
	}

	const handleCloseCrop = () => {
		if (newImage) {
			URL.revokeObjectURL(newImage);
		}
		setNewImage(null);
	}

	const handleSaveCroppedImage = async (croppedFile) => {

		const sizeValidation = validImageFile(croppedFile, "avatar");
		if (!sizeValidation.valid) {
			toast.error(sizeValidation.error);
			return;
		}

		const contentValidation = await validateImageContent(croppedFile);
		if (!contentValidation.valid) {
			toast.error(contentValidation.error);
			return;
		}

		await updateAvatar(croppedFile);
		handleCloseCrop();
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
							setNewImage={handleSaveCroppedImage}
							onClose={handleCloseCrop}
							cropShape="round"
							aspect={1 / 1}
						/>
					</ImageCropModal>
				}
				{!isMobile && settingsOpen && (
					<Modal
						open={settingsOpen}
						onClose={() => setSettingsOpen(false)}
						title={t('settings:popup.title')}
					>
						<SettingsContent />
					</Modal>
				)}
				{isMobile && settingsOpen && (
					<div className="fixed inset-0 bg-background z-50">

						<div className="h-full flex flex-col">
							<div className="p-4 flex items-center justify-between border-b">
								<h2>{t('settings:popup.title')}</h2>
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

						<div className="px-3 pb-4 bg-card border-b border-border shadow-md rounded-b-md">

							<div className="flex justify-between items-start relative">
								<AvatarEditable
									user={userData}
									canEdit={user.id === userData.id}
									onChange={updateImage}
								/>
								<div>
									<div className="flex justify-end items-center gap-2 mt-4">
										{user?.id != userData?.id ?
											(
												<>
													<div className="relative flex justify-center items-center">
														{disableFollowButton &&
															<Loading className="absolute text-muted-foreground" size="sm" />
														}
														<Button
															disabled={disableFollowButton}
															variant='outline'
															className={`transition-all
																${disableFollowButton ? 'cursor-none blur-[1px] opacity-70' : 'cursor-pointer'}`
															}
															onClick={() => handleUserFollowrs(userData.username, userData.isFollowing)}>
															{userData?.isFollowing ? t('header.unfollow') : t('header.follow')}
														</Button>
													</div>
													<FriendshipButton initialStatus={userData?.relationStatus} friendshipId={userData?.friendshipId} targetUserId={userData?.id} />
												</>
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
