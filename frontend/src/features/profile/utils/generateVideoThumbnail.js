

export function generateVideoThumbnailFromFile(file) {

    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.currentTime = 1; // pega frame em 1s

        video.onloadeddata = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg", 0.8);
        };
    });
}

export function generateVideoThumbnailFromUrl(url) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.src = url;

        video.onloadedmetadata = () => {
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                return resolve(null);
            }

            video.currentTime = 1;
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0);

                canvas.toBlob((blob) => {
                    resolve(blob || null);
                }, "image/jpeg", 0.6);

            } catch (err) {
                resolve(null);
            }
        };

        video.onerror = () => resolve(null);
    });
}