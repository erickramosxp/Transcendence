/**
 * Validação de arquivos no cliente antes do upload.
 *
 * Fluxo típico:
 * 1. `FileUploadButton` — MIME + tamanho na seleção (toast imediato).
 * 2. `ProfileHeader` / `useCreatePost` — revalidação + `validateImageContent` (decodificação real da imagem).
 * 3. `useCreatePost` — compressão opcional de fotos (exceto GIF) após validação.
 *
 * Limites de tamanho vêm de `limits` (`LIMITS.*FileMB`); conversão MB→bytes em `validators.mbToBytes`.
 */
import i18n from "@/i18n";
import { LIMITS } from "@/shared/validation/limits";
import { mbToBytes } from "@/shared/validation/validators";

/** MIME types aceitos para imagens (avatar e posts). Alinhado ao `accept` do FileUploadButton. */
const validImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]

/** MIME types aceitos para vídeo de post. */
const validVideoTypes = [
    "video/mp4"
]

/** Limites em bytes por contexto de upload, derivados de `LIMITS`. */
const fileSizeBytes = {
    avatar: mbToBytes(LIMITS.avatarFileMB),
    image: mbToBytes(LIMITS.postImageFileMB),
    video: mbToBytes(LIMITS.postVideoFileMB),
};

/** Limites em MB (usados nas mensagens de erro i18n). */
const maxMbByKind = {
	avatar: LIMITS.avatarFileMB,
	image: LIMITS.postImageFileMB,
	video: LIMITS.postVideoFileMB,
};

/**
 * Verifica se o arquivo excede o limite de tamanho para o contexto.
 *
 * @param {File} file
 * @param {"avatar"|"image"|"video"} kind - Define qual entrada de `LIMITS.*FileMB` aplicar.
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
function checkFileSize(file, kind) {
	if (file.size > fileSizeBytes[kind]) {
	  return {
		valid: false,
		error: i18n.t("errors.upload.fileTooLargeMax", { max: maxMbByKind[kind] }),
	  };
	}
	return { valid: true };
}

/**
 * Valida imagem por presença, MIME e tamanho.
 *
 * @param {File} file
 * @param {"avatar"|"image"} [kind="image"] - `"avatar"` usa `LIMITS.avatarFileMB`; `"image"` usa `LIMITS.postImageFileMB`.
 * @returns {{ valid: true } | { valid: false, error: string }}
 * @see FileUploadButton — validação na seleção
 * @see validateImageContent — segunda camada (arquivo corrompido / extensão falsa)
 */
export function validImageFile(file, kind = "image") {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validImageTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return checkFileSize(file, kind);
}

/**
 * Valida vídeo de post por presença, MIME (`video/mp4`) e tamanho (`LIMITS.postVideoFileMB`).
 *
 * @param {File} file
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
export function validVideoFile(file) {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validVideoTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return checkFileSize(file, "video");

}

/**
 * Confirma que o arquivo é uma imagem decodificável pelo navegador.
 * Complementa `validImageFile`: bloqueia arquivos com MIME de imagem mas conteúdo inválido.
 *
 * @param {File} file
 * @returns {Promise<{ valid: true } | { valid: false, error: string }>}
 */
export function validateImageContent(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ valid: true });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ valid: false, error: i18n.t("errors.upload.invalidImage") });
        };

        img.src = url;
    });
}

/** Limites em bytes exportados para testes ou uso externo. */
export { fileSizeBytes };
