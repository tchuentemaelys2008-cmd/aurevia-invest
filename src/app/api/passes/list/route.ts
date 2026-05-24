import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const passes = await prisma.pass.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });
  return NextResponse.json({ passes });
}
