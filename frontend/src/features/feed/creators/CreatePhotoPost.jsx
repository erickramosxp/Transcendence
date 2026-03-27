import { useCreatePost } from "./useCreatePost";
import { ImageIcon, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { createPortal } from "react-dom";
import { useFloatingEmojiPicker } from "../hooks/useFloatingEmojiPicker";

import {
	Card,
	CardContent,
	Textarea,
	Button,
	FileUploadButton,
} from "@/design-system";

function CreatePhotoPost({ onAddPost, onClose }) {
	const {
		text,
		file,
		setFile,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect,
	} = useCreatePost(onAddPost, onClose, "photo");

	const { anchorRef, pickerStyle } = useFloatingEmojiPicker(showEmojiPicker);

	return (
		<Card className="border-border bg-card/90 backdrop-blur-xl shadow-xl">
			<CardContent className="p-4 sm:p-6">
				<div className="flex gap-3 sm:gap-4">
					<div className="relative min-w-0 flex-1 space-y-3 sm:space-y-4">
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
							placeholder="Conte a história por trás da imagem"
							className="min-h-[80px] resize-none sm:min-h-[100px]"
						/>
						<div ref={anchorRef} />
						<p className="text-right text-sm text-muted-foreground">
							{text.length}/500
						</p>

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

						{!file && (
							<div className="flex items-center gap-2 rounded-md bg-muted p-3">
								<div className="flex flex-1 items-center gap-2">
									<ImageIcon className="h-5 w-5 text-primary" />
									<span className="text-xs text-muted-foreground">
										Uma imagem vale mais que mil palavras
									</span>
								</div>
							</div>
						)}

						{file && (
							<div className="flex items-center gap-2 rounded-md bg-muted p-3">
								<div className="flex min-w-0 flex-1 items-center gap-2">
									{file.type.startsWith("image/") ? (
										<ImageIcon className="h-5 w-5 shrink-0 text-primary" />
									) : (
										<span className="shrink-0 text-primary">🎥</span>
									)}

									<span className="truncate text-sm text-foreground">
										{file.name}
									</span>

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
							<div className="flex gap-1 sm:gap-2">
								<FileUploadButton
									onFileSelect={setFile}
									accept="image/jpeg,image/png,image/gif,image/webp"
								/>
							</div>

							<Button onClick={handleSubmit} variant="primary" size="sm">
								<Send className="mr-2 h-4 w-4" />
								Postar foto
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default CreatePhotoPost;