import { Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { useCreatePost } from "./useCreatePost";
import Textarea from "@/design-system/primitives/Textarea";
import { Button } from "@/design-system/primitives/Button";
import { Card, CardContent } from "@/design-system/primitives/Card";

function CreateTextPost({ onAddPost, onClose }) {

	const {
		text,
		error,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect,
		linkPreview,
		linkPreviewLoading,
		linkPreviewError,
	} = useCreatePost(onAddPost, onClose, "text");

	return (
		<Card className="max-w-[520px] w-full mx-auto border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
			<CardContent className="p-4 sm:p-6">
				<div className="flex gap-3 sm:gap-4">
					<div className="flex-1 space-y-3 sm:space-y-4 min-w-0 relative">
						<Textarea
							maxLength={500}
							value={text}
							onChange={handleChange}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit();
								}
							}}
							placeholder="O que você está pensando?"
							className="min-h-[80px] sm:min-h-[100px] resize-none border-slate-700 focus:border-dark:border-slate-700 focus:border-[#4a78b5] focus:ring-[#4a78b5]/20"
						/>
						{linkPreview && (
							<div className="mt-2">
								<div className="flex items-center gap-2">
									<img src={linkPreview.image} alt={linkPreview.title}  rel="noopener noreferrer" className="w-10 h-10 rounded-md" />
									<div>
										<h3 className="text-sm font-medium">{linkPreview.title}</h3>
										<p className="text-sm text-muted-foreground">{linkPreview.description}</p>
									</div>
								</div>
							</div>
						)}
						<p className="text-sm text-muted-foreground text-right">
							{text.length}/500
						</p>
						{showEmojiPicker && (
							<div className="absolute">
								<EmojiPicker onEmojiClick={handleEmojiSelect} />
							</div>
						)}
						<div className="flex items-center justify-end gap-2">
							<div>
								<Button
									onClick={handleSubmit}
									size="sm"
									className="bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover: to[#2c486d] shadow-lg shadow-[#4a78b5]/50 h-9"
								>
									<Send className="h-4 w-4 mr-2 " />
									Postar
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


export default CreateTextPost;
