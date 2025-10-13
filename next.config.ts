import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills for browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        'pino/lib/tools': false,
      };
    }

    // Externalize problematic packages for server builds
    if (isServer) {
      config.externals = [...(config.externals || []), '@libsql/client'];
    }

    // Handle LightningCSS native binaries
    config.resolve.alias = {
      ...config.resolve.alias,
      'lightningcss': 'lightningcss',
    };

    // Ensure native modules are included
    config.resolve.extensions = [...(config.resolve.extensions || []), '.node'];

    // Ignore LICENSE and other non-JS files
    config.module.rules.push({
      test: /\.(LICENSE|md|txt)$/i,
      use: 'ignore-loader',
    });

    // Ignore pino-pretty imports specifically
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
      'pino/lib/tools': false,
    };

    return config;
  },

  // Environment variables to expose to the client
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },

  // Output configuration for better compatibility
  output: 'standalone',

  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,

  // ESLint configuration - ignore during builds for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
