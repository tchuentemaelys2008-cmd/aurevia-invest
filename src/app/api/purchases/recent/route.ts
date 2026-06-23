export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { displayNames, passPool, amountPool, colorPool } from "@/lib/display-names";

export async function GET() {
  // Show every name in the list above, in a random order, each with a random
  // pass/amount. No database access.
  const shuffled = [...displayNames].sort(() => Math.random() - 0.5);
  const purchases = shuffled.map((name, i) => ({
    id: `live-${i}`,
    user: name,
    verified: Math.random() > 0.55,
    pass: passPool[Math.floor(Math.random() * passPool.length)],
    amount: amountPool[Math.floor(Math.random() * amountPool.length)],
    color: colorPool[Math.floor(Math.random() * colorPool.length)],
    createdAt: new Date(Date.now() - i * 60000).toISOString(),
  }));

  return NextResponse.json({ purchases });
}
