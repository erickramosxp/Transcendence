import { Button } from "@/design-system";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { cn } from "@/design-system/tokens/colors";
import { validImageFile, validVideoFile } from "@/features/profile/utils/validFile";

const ACCEPT_BY_KIND = {
	avatar: "image/jpeg,image/png,image/gif,image/webp",
	image: "image/jpeg,image/png,image/gif,image/webp",
	video: "video/mp4",
};

export function FileUploadButton({
	onFileSelect,
	/** @type {"avatar"|"image"|"video"} */
	fileKind = "image",
	accept,
	className
}) {
	const inputRef = useRef(null);
	const resolvedAccept = accept ?? ACCEPT_BY_KIND[fileKind];

	function handleChange(e) {
		const file = e.target.files[0];

		if (file) {
			const validation =
				fileKind === "video"
					? validVideoFile(file)
					: validImageFile(file, fileKind);

			if (!validation.valid) {
				toast.error(validation.error);
				e.target.value = "";
				return;
			}

			onFileSelect(file);
			e.target.value = "";
		}
	}

	return (
		<>
			<input
				type="file"
				ref={inputRef}
				className="hidden"
				onChange={handleChange}
				accept={resolvedAccept}
			/>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)}
				onClick={() => inputRef.current?.click()}
			>
				<Upload className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
			</Button>
		</>
	);
}
