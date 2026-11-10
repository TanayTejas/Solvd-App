import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API routes read db/schema.sql and db/seed.sql to set up an empty database.
  outputFileTracingIncludes: {
    "/api/state": ["./db/*.sql"],
    "/api/action": ["./db/*.sql"],
  },
};

export default nextConfig;
