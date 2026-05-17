
// Cria elemento Image a partir de uma URL
export const createImage = (url) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.crossOrigin = 'anonymous';
        image.src = url;
    });
};

// Recebe src + pixelCrop, retorna object URL da imagem cortada
export const getCroppedImage = async (imageSrc, pixelCrop, format = 'image/jpeg', quality = 0.8) => {
    const image = await createImage(imageSrc);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error("fail to cropped");
    }

    const TARGET_WIDTH = 400;
    const TARGET_HEIGHT = 400;

    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    //  drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    //  sx, sy, sWidth, sHeight
    //  de onde cortar na imagem original

    //  dx, dy, dWidth, dHeight
    //  onde desenhar no canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0, 0,
        TARGET_WIDTH,
        TARGET_HEIGHT
    );

    // Blob = Binary Large Object // um arquivo em memória (imagem, vídeo, etc)
    // Pode liberar depois com URL.revokeObjectURL(file || url)
    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            if (!file) {
                return reject(new Error('Error create image'));
            }

            resolve({
                url: URL.createObjectURL(file),
                file: file
            });
        }, format, quality);
    });
};