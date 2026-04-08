
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
        return { valid: false, error: "Arquivo não encontrado" };
    }

    if (!validImageTypes.includes(file.type)) {
        return { valid: false, error: "Tipo de imagem inválido" };
    }

    return { valid: true };
}

export function validVideoFile(file) {

    if (!file) {
        return { valid: false, error: "Arquivo não encontrado" };
    }

    if (!validVideoTypes.includes(file.type)) {
        return { valid: false, error: "Tipo de vídeo inválido" };
    }

    return { valid: true };

}