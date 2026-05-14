import { NextResponse } from "next/server";
import { getScene } from "@/lib/scenes";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const scene = getScene(id);
  if (!scene) {
    return NextResponse.json({ error: "scene not found", id }, { status: 404 });
  }
  return NextResponse.json(scene);
}
