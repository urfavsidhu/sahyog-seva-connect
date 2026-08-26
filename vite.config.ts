import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    // TanStack Start plugin — react's vite plugin ke pehle aana chahiye
    tanstackStart({
      server: {
        entry: "./src/server.ts", // hamara custom SSR error wrapper
      },
    }),
    viteReact(),
    // Nitro build/deploy plugin — Vercel preset hard-pinned rakha hai
    // taaki zero-config auto-detect galat fallback (cloudflare) na kare
    nitro({
      preset: "vercel",
    }),
  ],
});
