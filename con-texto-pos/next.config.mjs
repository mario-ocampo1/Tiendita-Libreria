import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    // Configuración clave para la estrategia offline-first
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // Aquí se agregarán reglas para retener JS/CSS/Fonts en caché
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
