import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the project's finalized agent instructions unchanged.
  agentRules: false,
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
