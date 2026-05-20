import { Button } from "@/design-system";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { cn } from "@/design-system/tokens/colors";
import { validImageFile, validVideoFile } from "@/features/profile/utils/validFile";

/**
 * Atributo `accept` do input por contexto.
 * Deve permanecer alinhado aos MIME types em `validFile.js` (`validImageTypes` / `validVideoTypes`).
 */
const ACCEPT_BY_KIND = {
	avatar: "image/jpeg,image/png,image/gif,image/webp",
	image: "image/jpeg,image/png,image/gif,image/webp",
	video: "video/mp4",
};

/**
 * Botão que abre o seletor de arquivos com validação imediata (MIME + tamanho via `LIMITS`).
 *
 * A validação aqui é a primeira camada; consumidores (`ProfileHeader`, `useCreatePost`)
 * devem revalidar e, para imagens, chamar `validateImageContent` antes do envio ao servidor.
 *
 * @param {Object} props
 * @param {(file: File) => void} props.onFileSelect - Callback após arquivo válido.
 * @param {"avatar"|"image"|"video"} [props.fileKind="image"] - Define `accept` e qual limite MB aplicar.
 * @param {string} [props.accept] - Sobrescreve `ACCEPT_BY_KIND[fileKind]`.
 * @param {string} [props.className] - Classes do botão.
 */
export function FileUploadButton({
	onFileSelect,
	fileKind = "image",
	accept,
	className
}) {
	const inputRef = useRef(null);
	const resolvedAccept = accept ?? ACCEPT_BY_KIND[fileKind];

	/**
	 * Valida na seleção: `validImageFile(file, fileKind)` ou `validVideoFile(file)`.
	 * Em erro, exibe toast e limpa o input para permitir nova tentativa.
	 */
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
