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
            {
                source: '/index.html',
                destination: '/',
                permanent: true,
            },
        ]
    },
    async rewrites() {
        const rewrites = [
            { source: '/about', destination: '/about.html' },
            { source: '/admin-login', destination: '/admin-login.html' },
            { source: '/admin', destination: '/admin.html' },
            { source: '/blog', destination: '/blog.html' },
            { source: '/faq', destination: '/faq.html' },
            { source: '/forgot-password', destination: '/forgot-password.html' },
            { source: '/login', destination: '/login.html' },
            { source: '/register', destination: '/register.html' },
            { source: '/reset-password', destination: '/reset-password.html' },
            { source: '/return-policy', destination: '/return-policy.html' },
            { source: '/return-product', destination: '/return-product.html' },
            { source: '/sitemap', destination: '/sitemap.html' },
            { source: '/track-order', destination: '/track-order.html' }
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
