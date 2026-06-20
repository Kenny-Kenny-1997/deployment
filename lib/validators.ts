import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  name: z.string().trim().min(1, "Name is required").max(60),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createPostSchema = z.object({
  content: z.string().trim().min(1, "Post cannot be empty").max(2000),
  imageUrl: z.string().url().optional().nullable(),
});

export const updatePostSchema = z.object({
  content: z.string().trim().min(1, "Post cannot be empty").max(2000),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(500),
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(1000),
});

export const createReportSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required").max(500),
  postId: z.string().uuid().optional(),
  reportedUserId: z.string().uuid().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
