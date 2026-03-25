import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Video, Music, ALargeSmall} from "lucide-react";
import { CreateTextPost, CreatePhotoPost, CreateVideoPost } from "@/features/feed/creators";
import  Popup  from "@/features/feed/components/Popup";
import { Card, Button } from "@/design-system";

function PostMenu({onAddPost}) {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState(null);

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
		<Card className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
			<div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 sm:gap-3">
				<Button onClick={() => handleOpen("text")} size="rounded" variant="secondary" >
					<ALargeSmall size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
				<Button  onClick={() => handleOpen("photo")} size="rounded" variant="secondary" >
					<Camera size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
				<Button onClick={() => handleOpen("video")} size="rounded" variant="secondary" >
					<Video size={0} className=" size-6 text-[#4a78b5]" />
				</Button>

				<Button onClick={() => handleOpen("music")}  size="rounded" variant="secondary" >
					<Music size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
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
							<div>A implementar</div>
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
