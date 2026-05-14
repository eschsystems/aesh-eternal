import { NextResponse } from "next/server";
import { recordInsight, listInsights } from "@/lib/insightStore";
import type { InsightKind } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ insights: listInsights() });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const b = body as Partial<{
    kind: InsightKind;
    payload: string;
    tags: string[];
    scene_id: string;
  }>;
  if (!b.kind || !b.payload || !b.scene_id) {
    return NextResponse.json(
      { error: "kind, payload, scene_id required" },
      { status: 400 },
    );
  }
  const ins = recordInsight({
    kind: b.kind,
    payload: b.payload,
    tags: b.tags ?? [],
    scene_id: b.scene_id,
  });
  return NextResponse.json(ins, { status: 201 });
}
