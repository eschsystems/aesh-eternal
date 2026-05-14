import { NextResponse } from "next/server";
import { listInsights } from "@/lib/insightStore";
import type { Insight, ExportBundle } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "bundle";
  const insights = listInsights();

  if (format === "jsonl") {
    const body = insights.map((i: Insight) => JSON.stringify(i)).join("\n");
    return new NextResponse(body, {
      headers: { "content-type": "application/x-ndjson" },
    });
  }

  const bundle: ExportBundle = {
    rag: insights.filter((i) => i.kind === "rag"),
    sft: insights.filter((i) => i.kind === "sft"),
    dpo: insights.filter((i) => i.kind === "dpo"),
    generated_at: new Date().toISOString(),
  };
  return NextResponse.json(bundle);
}
