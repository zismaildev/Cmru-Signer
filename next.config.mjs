/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // ปรับการตั้งค่าสำหรับ client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, // ปิดการใช้ fs ในฝั่ง client
        path: false, // ปิดการใช้ path ในฝั่ง client
      };
    }
    return config;
  },
};

export default nextConfig;
