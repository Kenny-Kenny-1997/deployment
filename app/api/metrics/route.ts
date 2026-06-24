import { NextRequest, NextResponse } from "next/server";

// POST /api/metrics — receives Core Web Vitals from WebVitalsReporter.
// Logs for now; swap the console.log for a write to a real analytics
// destination (Vercel Analytics, a DB table, Sentry) when you need
// historical dashboards instead of just live function logs.
export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();
    console.log("[metric]", metric.name, metric.value, metric.id);
    return NextResponse.json({ received: true });
  } catch {
    // A malformed beacon should never surface as a user-facing error
    return NextResponse.json({ received: false }, { status: 200 });
  }
}
