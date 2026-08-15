/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
                ],
            },
        ];
    },
    async redirects() {
        return [
            { source: '/index.html', destination: '/', permanent: true },
            { source: '/women.html', destination: '/category/women', permanent: true },
            { source: '/kids.html', destination: '/category/kids', permanent: true },
            { source: '/ornament.html', destination: '/category/ornament', permanent: true },
            { source: '/category.html', destination: '/category/women', permanent: true },
            { source: '/category', destination: '/category/women', permanent: true },
            { source: '/women', destination: '/category/women', permanent: true },
            { source: '/kids', destination: '/category/kids', permanent: true },
            { source: '/ornament', destination: '/category/ornament', permanent: true }
        ];
    },
    async rewrites() {
        const isDev = process.env.NODE_ENV !== 'production';
        const rewrites = [
            { source: '/admin-login', destination: '/admin-login.html' },
            { source: '/admin', destination: '/admin.html' }
        ];

        if (isDev) {
            rewrites.push(
                { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },
                { source: '/uploads/:path*', destination: 'http://localhost:5000/uploads/:path*' }
            );
        }

        return rewrites;
    },
};
export default nextConfig;
