export function getCategoryUrl(cat) {
    if (!cat) return '/category/women';
    
    let raw = (cat.redirectUrl || cat.slug || cat.name || '').trim();
    if (!raw) return '/category/women';

    // Strip .html
    raw = raw.replace(/\.html$/i, '');

    // Already formatted as /category/...
    if (raw.startsWith('/category/')) {
        return raw;
    }
    if (raw.startsWith('category/')) {
        return `/${raw}`;
    }

    // Strip leading slash if any
    let clean = raw.startsWith('/') ? raw.slice(1) : raw;
    clean = clean.toLowerCase();

    // Map known category slugs
    if (['women', 'womendress', 'women-wear', 'sarees'].includes(clean)) {
        return '/category/women';
    }
    if (['kids', 'kidszone', 'kid'].includes(clean)) {
        return '/category/kids';
    }
    if (['ornament', 'ornaments', 'jewellery', 'jewelry'].includes(clean)) {
        return '/category/ornament';
    }

    return `/category/${encodeURIComponent(clean)}`;
}
