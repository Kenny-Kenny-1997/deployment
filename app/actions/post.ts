"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { createPostSchema } from "@/lib/validators";

export type PostActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/**
 * Server Action for creating a post directly from a <form action={...}>.
 * Works without JavaScript (progressive enhancement) - the browser does
 * a normal form POST and Next.js handles routing it to this function.
 */
export async function createPostAction(
  _prevState: PostActionResult,
  formData: FormData
): Promise<PostActionResult> {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return { success: false, error: "You must be logged in to post" };
  }

  let userId: string;
  try {
    const payload = verifyAccessToken(token);
    userId = payload.sub;
  } catch {
    return { success: false, error: "Session expired, please log in again" };
  }

  const raw = {
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl") || undefined,
  };

  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.post.create({
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      authorId: userId,
    },
  });

  // Re-fetch the feed page server-side so the new post shows up
  // immediately without a full client refetch.
  revalidatePath("/feed");

  return { success: true };
}
