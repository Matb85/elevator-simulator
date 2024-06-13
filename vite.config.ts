import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(env => ({
  plugins: [react()],
  base: env.mode == "production" ? "/AVsystem-home-assignment/" : "/",
}));
