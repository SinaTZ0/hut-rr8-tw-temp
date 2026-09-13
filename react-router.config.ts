import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Nginx terminates HTTPS before forwarding to react-router-serve over HTTP.
  allowedActionOrigins: ["new.hut.ac.ir"],
} satisfies Config;
