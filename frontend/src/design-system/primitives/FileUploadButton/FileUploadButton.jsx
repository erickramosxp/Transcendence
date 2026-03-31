import { Button } from "@/design-system";
import { Upload } from "lucide-react";
import { useRef } from "react";

export function FileUploadButton({
	onFileSelect,
	accept = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg",
}) {
	const inputRef = useRef(null);

	function handleChange(e) {
		const file = e.target.files[0];

		if (file) {
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
				"video/mp4",
				"video/webm",
				"video/ogg",
			];

			if (allowedTypes.includes(file.type)) {
				onFileSelect(file);
				e.target.value = "";
			} else {
				alert("Apenas fotos (PNG, JPG, GIF, WebP) e vídeos (MP4, WebM, OGG) são permitidos");
				e.target.value = "";
			}
		}
	}

	return (
		<>
			<input
				type="file"
				ref={inputRef}
				className="hidden"
				onChange={handleChange}
				accept={accept}
			/>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0 sm:h-9 sm:w-9"
				onClick={() => inputRef.current?.click()}
			>
				<Upload className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
			</Button>
		</>
	);
}