import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                  // 🔥 Tillater tilgang fra mobil og andre enheter
    port: 3000,
    strictPort: true,            // 🚫 Ikke fall tilbake til annen port
    proxy: {
      "/api": "http://localhost:4000", // 👉 Ruter API-kall til backend
    },
  },
});
