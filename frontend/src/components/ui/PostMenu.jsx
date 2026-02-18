import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Card } from "./Card";
import { Button } from "./Button";
import { Camera, Video, Music, ALargeSmall} from "lucide-react";
import Popup from "./Popup";
import CreatePost from "./CreatePost";

function PostMenu({onAddPost}) {
	const [open, setOpen] = useState(false);

	return (
		<Card className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
			<div className="inline-flex items-center justify-center gap-2 p-4">
				<Button onClick={() => setOpen(true)} size="rounded" variant="secondary" >
					<ALargeSmall size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
				{open && createPortal(
					<Popup open={open} onClose={() => setOpen(false)}>
						<CreatePost onAddPost={onAddPost} open={open} onClose={() => setOpen(false)} />
					</Popup>,
					document.body
				)}
				<Button size="rounded" variant="secondary" >
					<Camera size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
				<Button size="rounded" variant="secondary" >
					<Video size={0} className=" size-6 text-[#4a78b5]" />
				</Button>

				<Button size="rounded" variant="secondary" >
					<Music size={0} className=" size-6 text-[#4a78b5]" />
				</Button>
			</div>

		</Card>
	);
}

export default PostMenu;
