"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { updateProfileSchema } from "@/lib/validators";

export type ProfileActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateProfileAction(
  _prevState: ProfileActionResult,
  formData: FormData
): Promise<ProfileActionResult> {
  const token = cookies().get("access_token")?.value;
  if (!token) {
    return { success: false, error: "You must be logged in" };
  }

  let userId: string;
  try {
    userId = verifyAccessToken(token).sub;
  } catch {
    return { success: false, error: "Session expired, please log in again" };
  }

  const raw = {
    name: formData.get("name") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { username: true },
  });

  revalidatePath(`/profile/${user.username}`);

  return { success: true };
}
