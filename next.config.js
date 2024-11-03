// const calendarTranspile = require('next-transpile-modules')([
//   '@fullcalendar/common',
//   '@fullcalendar/react',
//   '@fullcalendar/daygrid',
//   '@fullcalendar/list',
//   '@fullcalendar/timegrid'
// ]);

// const withImages = require('next-images');

// const redirects = {
//   async redirects() {
//     return [
//       {
//         source: '/dashboards/healthcare',
//         destination: '/dashboards/healthcare/doctor'
//       },
//       {
//         source: '/dashboards',
//         destination: '/dashboards /reports'
//       },
//       {
//         source: '/applications',
//         destination: '/applications/file-manager'
//       },
//       {
//         source: '/blocks',
//         destination: '/blocks/charts-large'
//       },
//       {
//         source: '/management',
//         destination: '/management/users'
//       }
//     ];
//   }
// };
export const experimental = {
  appDir: true
}
export const eslint = {
  // Warning: This allows production builds to successfully complete even if
  // project has ESLint errors.
  ignoreDuringBuilds: true,
};

export const typescript = {
  // !! WARN !!
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  // !! WARN !!
  ignoreBuildErrors: true,
};

export const images = {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '3000',
      // pathname: '/account123/**',
    },
    {
      protocol: 'http',
      hostname: '192.168.10.96',
      port: '3001',
    }
  ],
}

export const rewrites = async () => {
  return [
    {
      source: '/api/onlineAdmission',
      destination: 'http://192.168.10.96:3001/:path*',
    },
    {
      source: '/api/fee/class_wise',
      destination: 'http://localhost:3001/:path*',
    },
    {
      source: '/api/bkash/get-token',
      destination: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
    },
    {
      source: '/api/bkash/create-payment',
      destination: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
    },
  ]
}

export const headers = async () => {
  return [
    // {
    //   // matching all API routes
    //   source: "https://tokenized.sandbox.bka.sh/*",
    //   headers: [
    //     { key: "Access-Control-Allow-Credentials", value: "true" },
    //     { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
    //     { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
    //     { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
    //   ]
    // },
    {
      // matching all API routes
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
        { key: "Access-Control-Allow-Methods", value: "GET,POST" },
        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
      ]
    },
  ]
}

const nextConfig = {
  // reactStrictMode: true,
  output: "standalone",
}

export default nextConfig