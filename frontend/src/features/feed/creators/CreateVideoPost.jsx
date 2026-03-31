import { ImageIcon, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { useCreatePost } from "./useCreatePost";

import { Button } from "@/design-system/primitives/Button";
import { Card, CardContent } from "@/design-system/primitives/Card";
import Textarea from "@/design-system/primitives/Textarea";
import FileUploadButton from "@/design-system/primitives/FileUploadButton";
import { useTranslation } from "react-i18next";


function CreateVideoPost({ onAddPost, onClose }) {
	const {
		text,
		file, setFile,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect
	} = useCreatePost(onAddPost, onClose, "video");
	const { t } = useTranslation('feed');

	return (
		<Card className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
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
							placeholder={t('createPost.video.placeholder')}
							className="min-h-[80px] sm:min-h-[100px] resize-none border-slate-700 focus:border-dark:border-slate-700 focus:border-[#4a78b5] focus:ring-[#4a78b5]/20"
						/>
						<p className="text-sm text-muted-foreground text-right">
							{text.length}/500
						</p>
						{showEmojiPicker && (
							<div className="absolute">
								<EmojiPicker onEmojiClick={handleEmojiSelect} />
							</div>
						)}
						{!file && (
							<div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
								<div className="flex-1 flex items-center gap-2">
									<span className="text-[#4a78b5]">🎥</span>
									<span className="text-xs text-slate-500">
										{t('createPost.video.emptyHint')}
									</span>
								</div>
							</div>
						)}
						{file && (
							<div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
								<div className="flex-1 flex items-center gap-2">
									{file.type.startsWith('image/') ? (
										<ImageIcon className="h-5 w-5 text-[#4a78b5]" />
									) : (
										<span className="text-[#4a78b5]">🎥</span>
									)}
									<span className="text-sm truncate">{file.name}</span>
									<span className="text-xs text-slate-500">
										({(file.size / 1024 / 1024).toFixed(2)} MB)
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setFile(null)}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
						<div className="flex items-center justify-between gap-2">
							<div className="flex gap-1 sm:gap-2">
								<FileUploadButton onFileSelect={setFile} accept="video/mp4,video/webm,video/ogg" />
							</div>
							<div>
								<Button
									onClick={handleSubmit}
									size="sm"
									className="bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover: to[#2c486d] shadow-lg shadow-[#4a78b5]/50 h-9"
								>
									<Send className="h-4 w-4 mr-2 " />
									{t('createPost.video.submit')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default CreateVideoPost;
