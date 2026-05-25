import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, JWTPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): role is AdminRole {
  return !!role && ADMIN_ROLES.includes(role as AdminRole);
}

export async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || !isAdminRole(auth.role)) return null;
  return auth;
}

export async function logAdminAction(
  admin: JWTPayload,
  action: string,
  target?: string,
  details?: Prisma.InputJsonValue,
  req?: NextRequest
) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        adminEmail: admin.email,
        adminRole: admin.role,
        action,
        target,
        details: details || undefined,
        ipAddress: req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      },
    });
  } catch {
    // Admin logs must not block the action that already succeeded.
  }
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, key: string, limit = 60, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  return null;
}
