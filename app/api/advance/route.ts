import { NextResponse } from "next/server";
import { getScene, listScenes } from "@/lib/scenes";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const b = body as Partial<{ from_scene: string; choice_id: string }>;
  if (!b.from_scene) {
    return NextResponse.json({ error: "from_scene required" }, { status: 400 });
  }
  const current = getScene(b.from_scene);
  if (!current) {
    return NextResponse.json({ error: "scene not found" }, { status: 404 });
  }
  const choice = b.choice_id
    ? current.choices.find((c) => c.id === b.choice_id)
    : undefined;
  const nextId = choice?.advance_to;
  const next = nextId ? getScene(nextId) : undefined;
  return NextResponse.json({
    advanced: !!next,
    next_scene: next ?? null,
    available_scenes: listScenes().map((s) => ({ id: s.id, title: s.title, era: s.era })),
  });
}
