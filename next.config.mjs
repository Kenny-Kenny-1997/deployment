/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const baseHeaders = [
  // Prevents clickjacking by disallowing the app from being framed
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from MIME-sniffing a response away from its declared content-type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limits how much referrer info leaks to other origins on outbound links
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Pulse doesn't use camera/mic/geolocation, so disable them outright
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// HSTS and CSP are production-only:
// - HSTS forcing HTTPS makes no sense against a plain-http localhost.
// - Next.js's dev-mode Fast Refresh runtime uses eval() to apply hot
//   updates, which a strict CSP without 'unsafe-eval' blocks outright
//   (this is what was breaking the register page). The production
//   build doesn't use that eval()-based runtime, so the stricter
//   policy only needs to apply there.
const productionOnlyHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const securityHeaders = isDev ? baseHeaders : [...baseHeaders, ...productionOnlyHeaders];

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
