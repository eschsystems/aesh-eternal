import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const cmd = (((body as { command?: string }).command ?? "") + "").trim();
  // Placeholder. Real backend logic to be wired in later.
  return NextResponse.json({
    output: cmd ? [`bash: ${cmd}: command not found`] : [],
  });
}
