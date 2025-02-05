/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // เพิ่มการใช้ file-loader สำหรับไฟล์ pdf.worker.js
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[hash].[ext]",  // เปลี่ยนชื่อไฟล์
          outputPath: "static/pdf-workers/", // กำหนด path ที่จะเก็บไฟล์
        },
      },
    });
    return config;
  },
};

export default nextConfig;
