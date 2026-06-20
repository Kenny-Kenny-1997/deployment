import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError, ForbiddenError } from "./auth";

/**
 * Central error handler for API routes. Keeps route handlers thin -
 * they just throw, and this maps known error types to the right
 * HTTP status + JSON shape.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  // Prisma unique constraint violation
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return NextResponse.json(
      { error: "A record with this value already exists" },
      { status: 409 }
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
