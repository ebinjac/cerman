import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
      util: false,
      url: false,
      assert: false,
      buffer: false,
      process: false,
      querystring: false,
      punycode: false,
      string_decoder: false,
      timers: false,
      events: false,
      domain: false,
      constants: false,
      vm: false,
      module: false,
      _stream_duplex: false,
      _stream_passthrough: false,
      _stream_readable: false,
      _stream_transform: false,
      _stream_writable: false,
    };
    return config;
  }
};

export default nextConfig;


