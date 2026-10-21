// import type {NextConfig} from "next";
// const nextConfig:NextConfig={
//   devIndicators:false,
//   turbopack:{root:process.cwd()},
//   serverExternalPackages:["typeorm","pg"],
// };
// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  turbopack: {
    root: process.cwd(),
  },

  serverExternalPackages: ["typeorm", "pg"],

  experimental: {
    cpus: 1,
  },
};

export default nextConfig;