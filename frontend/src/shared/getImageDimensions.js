
export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        // 1. cria uma URL para o navegador ler o arquivo
        const src = URL.createObjectURL(file);
        const img = new Image();

        // 2. pegamos o tamanho
        img.onload = () => {
            const dimensions = {
                width: img.naturalWidth,   // Largura real em pixels
                height: img.naturalHeight  // Altura real em pixels
            };
            
            URL.revokeObjectURL(src); // Limpa a memória!
            resolve(dimensions);
        };

        // 3. erro caso o arquivo esteja corrompido
        img.onerror = (err) => {
            URL.revokeObjectURL(src); // Limpa a memória
            reject(new Error("The image dimensions could not be read"));
        };

        img.src = src;
    });
};