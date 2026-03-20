export default {
  experimental: {
    appDir: true,
    runtime: 'nodejs',
    serverComponents: true,
  },
  future: {
    webpack5: true,
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  tailwindcss: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compilerOptions: {
    target: 'es6',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'node',
    resolveJsonModule: true,
    isolateModules: true,
    jsx: 'react-jsx',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};