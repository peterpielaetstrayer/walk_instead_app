import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Manual guarded registration avoids unhandled errors when workers are blocked.
  register: false,
  // Route transitions are client-side in Next; cache visited route HTML explicitly.
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
