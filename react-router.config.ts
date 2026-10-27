import type { Config } from "@react-router/dev/config";

export default {
  // Static SPA mode. The Express server in /server owns the API.
  ssr: false,

  // Adopt the React Router v8-compatible behavior while remaining on the
  // stable v7.18.4 toolchain. This removes the v8 future-flag warnings and
  // keeps the project ready for a later major-version upgrade.
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
