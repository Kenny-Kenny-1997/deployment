"use client";

import { useReportWebVitals } from "next/web-vitals";

// Drop <WebVitalsReporter /> once inside app/layout.tsx, alongside
// <AuthProvider>. Logs Core Web Vitals (LCP, CLS, INP, FCP, TTFB) to
// the console in dev, and beacons them to /api/metrics in production.
// Note: the callback's parameter type is inferred from
// useReportWebVitals itself — `web-vitals` isn't a real top-level
// package in node_modules (Next vendors it internally), so importing
// a type named "web-vitals" directly would fail to resolve.
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[web-vitals]", metric.name, metric.value);
      return;
    }

    const body = JSON.stringify(metric);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/metrics", body);
    } else {
      fetch("/api/metrics", { body, method: "POST", keepalive: true });
    }
  });

  return null;
}
