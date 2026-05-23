import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Video, Music, ALargeSmall} from "lucide-react";

import { useTranslation } from "react-i18next";

import { CreateTextPost, CreatePhotoPost, CreateVideoPost } from "@/features/feed/creators";
import  Popup  from "@/features/feed/components/Popup";

import { Card, Button } from "@/design-system";

function PostMenu({onAddPost}) {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState(null);
	const { t } = useTranslation('feed');

	function handleOpen(postType)
	{
		setType(postType);
		setOpen(true);
	}

	function handleClose(){
		setOpen(false);
		setType(null);
	}
	return (
		<Card className="border-border bg-card/90 backdrop-blur-xl">
			<div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 sm:gap-3">
				<Button onClick={() => handleOpen("text")} size="rounded" variant="secondary" >
					<ALargeSmall className=" size-6 text-primary"/>
				</Button>
				<Button  onClick={() => handleOpen("photo")} size="rounded" variant="secondary" >
					<Camera className=" size-6 text-primary"/>
				</Button>
				<Button onClick={() => handleOpen("video")} size="rounded" variant="secondary" >
					<Video className=" size-6 text-primary"/>
				</Button>

				{/* <Button onClick={() => handleOpen("music")}  size="rounded" variant="secondary" >
					<Music className=" size-6 text-primary"/>
				</Button> */}
			</div>
			{open && createPortal(
					<Popup open={open} onClose={handleClose}>
						{type === "text" &&(
							<CreateTextPost
							onAddPost={onAddPost}
							onClose={handleClose}
							/>
						)}
						{type === "photo" &&(
							<CreatePhotoPost
							onAddPost={onAddPost}
							onClose={handleClose}
							/>
						)}
						{type === "video" &&(
							<CreateVideoPost
							onAddPost={onAddPost}
							onClose={handleClose}
							/>
						)}
						{type === "music" &&(
							<div>{t('menu.notImplemented')}</div>
							// <CreateMusicPost
							// onAddPost={onAddPost}
							// onClose={handleClose}
							// />
						)}
					</Popup>,
					document.body
				)}
		</Card>
	);
}

export default PostMenu;
