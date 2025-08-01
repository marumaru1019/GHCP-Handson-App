import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 📝 Azure Static Web Apps用の出力設定
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  //  ビルド最適化設定
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 💡 Windows環境でpnpmのシンボリックリンクエラーを回避
      config.resolve.symlinks = false;
    }
    return config;
  },
};

export default nextConfig;