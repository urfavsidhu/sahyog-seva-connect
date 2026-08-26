// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Hard-pin the build target to Vercel. Without this, nitro's zero-config
  // auto-detection can fall back to the "cloudflare-module" default when the
  // build doesn't run inside Vercel's own build environment (or Vercel's
  // project settings don't line up with it), which produces JS chunk paths
  // that don't match what gets served — causing 404s on asset files like
  // `/assets/_id-*.js` and the app getting stuck on its initial loading state.
  nitro: {
    preset: "vercel",
  },
});
