import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Card } from "./Card";
import { Button } from "./Button";
import { Camera, Video, Music, ALargeSmall} from "lucide-react";
import Popup from "./Popup";
import { CreateTextPost, CreatePhotoPost, CreateVideoPost } from "./creators";

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
			<div className="inline-flex items-center justify-center gap-2 p-4">
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
