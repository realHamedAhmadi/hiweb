/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared workspace packages ship as uncompiled TypeScript source
  // (see packages/ui/package.json "main"), so Next needs to transpile
  // them itself rather than expecting pre-built JS.
  transpilePackages: ["@hiweb/ui"],
  // i18n note: Next.js App Router handles internationalization via routing
  // (e.g. /en, /fa, /ar, /tr, /fr segments) rather than the legacy `i18n`
  // config key. Locale routing structure is intentionally not implemented
  // yet — this is a Section 11 (i18n) decision, including RTL handling for
  // Persian and Arabic, to be designed deliberately rather than assumed here.
};

module.exports = nextConfig;
