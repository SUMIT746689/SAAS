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
        hostname: 'coaching.edu360.com.bd',
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
      {
        protocol: 'http',
        hostname: '192.168.11.69',
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
  rewrites:
    [
      {
        source: '/api/onlineAdmission',
        destination: 'http://192.168.10.96:3001/:path*',
      },
      {
        source: '/api/bkash/pay_with_website/get-token',
        destination: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      },
      {
        source: '/api/bkash/pay_with_website/create-payment',
        destination: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      },
    ],
  // reactStrictMode:'true',
  output: 'standalone'
}

module.exports = nextConfig
