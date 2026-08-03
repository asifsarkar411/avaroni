export function getImageUrl(img) {
    if (!img) return '/img/profile_image.jpg';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('data:image/')) return img;
    if (img.startsWith('/uploads/')) return img;
    if (img.startsWith('uploads/')) return `/${img}`;
    return `/uploads/${img}`;
}
