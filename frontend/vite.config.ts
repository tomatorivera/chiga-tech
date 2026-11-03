import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Mismo origen que la API para la cookie de sesión (ADR técnico 0003)
  server: {
    proxy: {
      "/api": "http://localhost:5098",
      "/auth": "http://localhost:5098",
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
