import i18n from "@/i18n";
import { LIMITS, mbToBytes } from "@/shared/validation/limits";

const validImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]

const validVideoTypes = [
    "video/mp4"
]

const fileSizeBytes = {
    avatar: mbToBytes(LIMITS.avatarFileMB),
    image: mbToBytes(LIMITS.postImageFileMB),
    video: mbToBytes(LIMITS.postVideoFileMB),
};

const maxMbByKind = {
	avatar: LIMITS.avatarFileMB,
	image: LIMITS.postImageFileMB,
	video: LIMITS.postVideoFileMB,
  };
  function checkFileSize(file, kind) {
	if (file.size > fileSizeBytes[kind]) {
	  return {
		valid: false,
		error: i18n.t("errors.upload.fileTooLargeMax", { max: maxMbByKind[kind] }),
	  };
	}
	return { valid: true };
  }

export function validImageFile(file, kind = "image") {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validImageTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return checkFileSize(file, kind);
}

export function validVideoFile(file) {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validVideoTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return checkFileSize(file, "video");

}

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

export { fileSizeBytes };
