import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Stop `next dev` from appending its own block to CLAUDE.md.
  agentRules: false,
};

export default nextConfig;
