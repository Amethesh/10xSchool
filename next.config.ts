import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "vnwacjzpzyblrvastejt.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      // Ad platforms and app listings expect a privacy policy at the site root.
      // next.config redirects run before middleware, so this stays reachable
      // to logged-out visitors even though /privacy-policy is not whitelisted.
      {
        source: "/privacy-policy",
        destination: "/landing/privacy-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
