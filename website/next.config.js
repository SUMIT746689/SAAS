/** @type {import('next').NextConfig} */
const nextConfig = {
  // headers: [
  //   {
  //     // matching all API routes
  //     source: "/api/:path*",
  //     headers: [
  //       { key: "Access-Control-Allow-Credentials", value: "true" },
  //       { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
  //       { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
  //       { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
  //     ]
  //   }
  // ],
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.edu360.com.bd',
        port: '',
        pathname: '/api/get_file/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/get_file/**',
      },
      {
        protocol: 'http',
        hostname: '172.17.0.1',
        port: '3000',
        pathname: '/api/get_file/**',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // reactStrictMode:'true',
  output: 'standalone'
}

module.exports = nextConfig
