import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Don't precache firebase-messaging-sw.js — it's managed separately
  buildExcludes: [/firebase-messaging-sw\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
