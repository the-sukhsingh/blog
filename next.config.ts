import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  /**
   * Standalone output mode: copies only the traced files needed for production
   * into `.next/standalone`, producing a minimal Docker image (~300MB vs ~1GB).
   * This setting is ignored by Vercel's build pipeline, so cloud deployments
   * are unaffected.
   */
  output: "standalone",
};

export default nextConfig;
