

export async function resolveMediaType(url, mimeTypeFromBackend) {
  // Tipo vindo do backend
  if (mimeTypeFromBackend) {
    if (mimeTypeFromBackend.startsWith('image/')) return 'image';
    if (mimeTypeFromBackend.startsWith('video/')) return 'video';
  }

  // verificar pela extensão da URL
  const cleanUrl = url.split('?')[0];
  const extension = cleanUrl.split('.').pop().toLowerCase();

  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExt = ['mp4', 'webm', 'ogg'];

  if (imageExt.includes(extension)) return 'image';
  if (videoExt.includes(extension)) return 'video';

  // Fallback final (requisição HEAD para ver o mimetype)
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    console.log(contentType);

    if (contentType?.startsWith('image/')) return 'image';
    if (contentType?.startsWith('video/')) return 'video';
  } catch (err) {
    return;
    console.warn('Erro ao detectar tipo via HEAD:', err);
  }

  return '';
}