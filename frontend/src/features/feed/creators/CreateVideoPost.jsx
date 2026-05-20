import { ImageIcon, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useCreatePost } from "./useCreatePost";
import { createPortal } from "react-dom";
import { useFloatingEmojiPicker } from "../hooks/useFloatingEmojiPicker";

import { Button, Card, CardContent, CardFooter, Textarea, FileUploadButton, ProgressBar } from "@/design-system";
import { PostPreview } from "../components/PostPreview";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/providers/AuthProvider";
import { LIMITS } from "@/shared/validation/limits";


function CreateVideoPost({ onAddPost, onClose }) {

	const {
		text,
		file,
		setFile,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect,
		avatarUrl,
		uploadPercent,
		maxTextLength,
	} = useCreatePost(onAddPost, onClose, "video");

	const { t } = useTranslation('feed');

	const { anchorRef, pickerStyle } = useFloatingEmojiPicker(showEmojiPicker);
	const { user } = useAuth();

	return (
		<Card className="border-border bg-card/90 backdrop-blur-xl shadow-xl">
			<CardContent className="p-4 sm:p-6">
				<div className="flex gap-3 sm:gap-4">
					<div className="flex-1 space-y-3 sm:space-y-4 min-w-0 relative">
						<Textarea
							maxLength={maxTextLength}
							value={text}
							onChange={handleChange}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit();
								}
							}}
							placeholder={t('createPost.video.placeholder')}
							className="min-h-[80px] resize-none sm:min-h-[100px]"
						/>
						<div ref={anchorRef} />
						<p className="text-sm text-muted-foreground text-right">
							{text.length}/{maxTextLength}
						</p>
						{!file && (
							<div className="flex items-center gap-2 rounded-md bg-muted p-3">
								<div className="flex-1 flex items-center gap-2">
									<span className="text-primary">🎥</span>
									<span className="text-xs text-muted-foreground">
										{t('createPost.video.emptyHint')}
									</span>
								</div>
							</div>
						)}
						{showEmojiPicker &&
							createPortal(
								<div
									className="fixed z-[100]"
									style={{
										top: `${pickerStyle.top}px`,
										left: `${pickerStyle.left}px`,
									}}
								>
									<EmojiPicker onEmojiClick={handleEmojiSelect} />
								</div>,
								document.body
							)}
						{file && (
							<div className="flex items-center gap-2 rounded-md bg-muted p-3">
								<div className="flex flex-1 items-center gap-2 min-w-0">
									{file.type.startsWith('image/') ? (
										<ImageIcon className="h-5 w-5 text-primary" />
									) : (
										<span className="shrink-0 text-primary">🎥</span>
									)}
									<span className="truncate text-sm text-foreground">{file.name}</span>
									<span className="shrink-0 text-xs text-muted-foreground">
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
							<div className="flex gap-1 sm:gap-2 items-center">
								<FileUploadButton
									onFileSelect={setFile}
									accept="video/mp4"
									fileKind="video"
								/>
								<div className="text-xs text-muted-foreground">
									<span>Max size ({LIMITS.postVideoFileMB}MB)</span>
								</div>
							</div>
							<div>
								<Button
									onClick={handleSubmit}
									variant="primary"
									size="sm"
									className="h-9"
									disabled={(uploadPercent !== null)}
								>
									<Send className="h-4 w-4 mr-2 " />
									{t('createPost.video.submit')}
								</Button>
							</div>
						</div>
					</div>
				</div>
				{(uploadPercent !== null) &&
					<ProgressBar value={uploadPercent} />
				}
			</CardContent>
			{file && (uploadPercent == null) &&
				<CardFooter className='px-2.5'>
					<PostPreview
						content={text}
						file={file}
						user={{
							...user,
							avatarUrl
						}}
					/>
				</CardFooter>
			}
		</Card>
	);
}

export default CreateVideoPost;
