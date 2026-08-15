export function getImageUrl(img) {
    if (!img) return '/img/profile_image.jpg';
    
    // External or data URLs
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/')) {
        return img;
    }
    
    // Normalize relative prefix './'
    let clean = img.startsWith('./') ? img.slice(2) : img;
    
    // Direct /img or img paths
    if (clean.startsWith('/img/') || clean.startsWith('img/')) {
        return clean.startsWith('/') ? clean : `/${clean}`;
    }
    
    // Direct uploads paths
    if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
        return clean.startsWith('/') ? clean : `/${clean}`;
    }
    
    // Already absolute paths (e.g. /profile_image.jpg, /logo.png, /fabicon.png, /icons/...)
    if (clean.startsWith('/')) {
        return clean;
    }
    
    // Filename in uploads folder
    return `/uploads/${clean}`;
}
