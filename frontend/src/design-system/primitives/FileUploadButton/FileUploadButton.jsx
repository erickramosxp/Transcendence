import { Button } from "@/design-system";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/design-system/tokens/colors";

export function FileUploadButton({
	onFileSelect,
	maxMBSize = 2,
	accept = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg",
	className
}) {
	const inputRef = useRef(null);

	function handleChange(e) {
		const file = e.target.files[0];

		if (file) {

			const maxSizeBytes = maxMBSize * 1024 * 1024;

			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
				"video/mp4",
				"video/webm",
				"video/ogg",
			];

			if (!allowedTypes.includes(file.type)) {
				alert("Este formato de arquivo não é permitido.");
                e.target.value = "";
                return;
			}

			if (file.size > maxSizeBytes) {
				alert(`O arquivo excede o limite de ${maxMBSize}MB.`);
                e.target.value = "";
                return;
			}
			// } else {
			// 	alert("Apenas fotos (PNG, JPG, GIF, WebP) e vídeos (MP4, WebM, OGG) são permitidos");
			// 	e.target.value = "";
			// }
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
				accept={accept}
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