import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(env => ({
  plugins: [react()],
  base: env.mode == "production" ? "/elevator-simulator/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/algorithm"),
      "~": path.resolve(__dirname, "./src/components"),
    },
  },
}));
