/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.pexels.com",
            },
            {
                protocol: "https",
                hostname: "render.fineartamerica.com",
            },
            {
                protocol: "https",
                hostname: "**",
            },
        ]
    }
};

export default nextConfig;
