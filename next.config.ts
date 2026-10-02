import type { NextConfig } from "next";
import { DRAFT_REQUEST_LIMIT_BYTES } from "./lib/draft-limits";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Stop `next dev` from appending its own block to CLAUDE.md.
  agentRules: false,
  experimental: {
    serverActions: {
      // A Draft's whole text is sent in one Server Action call. 2 MB holds a
      // very long contract; the Add a Draft form refuses anything larger.
      bodySizeLimit: DRAFT_REQUEST_LIMIT_BYTES,
    },
  },
};

export default nextConfig;
