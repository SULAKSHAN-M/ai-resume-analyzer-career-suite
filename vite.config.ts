import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const API_PORT = process.env.API_PORT || 4000;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  // Lets imports like "~/lib/utils" resolve through tsconfig.json "paths".
  resolve: { tsconfigPaths: true },
  server: {
    proxy: {
      // In dev, the API runs as its own process (see server/index.js) on API_PORT.
      // This makes it look same-origin to the browser, so the session cookie works
      // exactly as it will in production, where one process serves both.
      "/api": { target: `http://localhost:${API_PORT}`, changeOrigin: true },
    },
  },
});
