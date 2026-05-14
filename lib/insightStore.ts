import type { Insight } from "./types";

const insights: Insight[] = [];

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function listInsights(): Insight[] {
  return [...insights];
}

export function recordInsight(input: Omit<Insight, "id" | "created_at">): Insight {
  const ins: Insight = {
    id: uuid(),
    created_at: new Date().toISOString(),
    ...input,
  };
  insights.push(ins);
  return ins;
}

export function clearInsights(): void {
  insights.length = 0;
}
