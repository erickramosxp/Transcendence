
export const generateResizedBlob = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(src);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calcula proporções mantendo o aspecto original
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Erro ao gerar variação de imagem"));
            }, 'image/jpeg', quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(src);
            reject(new Error("Erro ao carregar imagem"));
        };
        img.src = src;
    });
};