import i18n from "@/i18n";

const validImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]

const validVideoTypes = [
    "video/mp4"
]

const limits = {
    avatar: 2 * 1024 * 1024, // 2MB
    image: 5 * 1024 * 1024,  // 5MB
    video: 20 * 1024 * 1024  // 20MB
};

export function validImageFile(file) {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validImageTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return { valid: true };
}

export function validVideoFile(file) {

    if (!file) {
        return { valid: false, error: i18n.t("errors.upload.notFound") };
    }

    if (!validVideoTypes.includes(file.type)) {
        return { valid: false, error: i18n.t("errors.upload.invalidType") };
    }

    return { valid: true };

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