import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
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