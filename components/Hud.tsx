"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Artifact, DesktopIcon, Insight, Interstitial, Persona, Scene, SceneInput as SceneInputT } from "@/lib/types";

type Props = {
  initialScene: Scene;
  allScenes: Scene[];
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const KIND_COLOR: Record<Insight["kind"], string> = {
  rag: "text-kind-rag",
  sft: "text-kind-sft",
  dpo: "text-kind-dpo",
};

const KIND_LABEL: Record<Insight["kind"], string> = {
  rag: "MEMORY",
  sft: "STYLE",
  dpo: "JUDGMENT",
};

function renderEmphasis(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i} className="italic">{part.slice(1, -1)}</em>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function Hud({ initialScene, allScenes }: Props) {
  const [currentSceneId, setCurrentSceneId] = useState(initialScene.id);
  const scene = useMemo(
    () => allScenes.find((s) => s.id === currentSceneId) ?? initialScene,
    [currentSceneId, allScenes, initialScene],
  );

  const [insights, setInsights] = useState<Insight[]>([]);
  const [pickedChoiceIds, setPickedChoiceIds] = useState<Set<string>>(new Set());
  const [visitedLayerDrops, setVisitedLayerDrops] = useState<Set<string>>(new Set());
  const [layerDropOpen, setLayerDropOpen] = useState(false);
  const [openArtifactId, setOpenArtifactId] = useState<string | null>(null);
  const [revealedArtifactIds, setRevealedArtifactIds] = useState<Set<string>>(new Set());
  const [submittedInputIds, setSubmittedInputIds] = useState<Set<string>>(new Set());
  const [clickedDesktopIconIds, setClickedDesktopIconIds] = useState<Set<string>>(new Set());
  const [clickedPersonaIds, setClickedPersonaIds] = useState<Set<string>>(new Set());
  const [personasCompleteFired, setPersonasCompleteFired] = useState<Set<string>>(new Set());
  const [exportRevealOpen, setExportRevealOpen] = useState(false);

  const layerDropVisited = visitedLayerDrops.has(scene.id);

  const layerUnlocked = useMemo(
    () =>
      scene.choices.some(
        (c) => pickedChoiceIds.has(c.id) && c.unlocks_layer_drop,
      ) ||
      !!(scene.input?.unlocks_layer_drop && submittedInputIds.has(scene.input.id)) ||
      !!scene.desktop_icons?.some(
        (i) => clickedDesktopIconIds.has(i.id) && i.unlocks_layer_drop,
      ),
    [scene, pickedChoiceIds, submittedInputIds, clickedDesktopIconIds],
  );

  function clickDesktopIcon(iconId: string) {
    if (!scene.desktop_icons?.some((i) => i.id === iconId)) return;
    setClickedDesktopIconIds((prev) => new Set(prev).add(iconId));
  }

  function clickPersona(personaId: string) {
    const persona = scene.personas?.find((p) => p.id === personaId);
    if (!persona || persona.is_center) return;
    if (clickedPersonaIds.has(personaId)) return;

    const newClicked = new Set(clickedPersonaIds).add(personaId);
    setClickedPersonaIds(newClicked);

    if (persona.insight) {
      addInsight({
        kind: persona.insight.kind,
        payload: persona.insight.payload,
        tags: persona.insight.tags,
      });
    }

    const nonCenter = scene.personas?.filter((p) => !p.is_center) ?? [];
    const allClicked = nonCenter.every((p) => newClicked.has(p.id));
    if (
      allClicked &&
      scene.personas_complete_insight &&
      !personasCompleteFired.has(scene.id)
    ) {
      addInsight({
        kind: scene.personas_complete_insight.kind,
        payload: scene.personas_complete_insight.payload,
        tags: scene.personas_complete_insight.tags,
      });
      setPersonasCompleteFired((prev) => new Set(prev).add(scene.id));
    }
  }

  function addInsight(template: Omit<Insight, "id" | "created_at" | "scene_id"> & { scene_id?: string }) {
    const ins: Insight = {
      id: uuid(),
      scene_id: template.scene_id ?? scene.id,
      created_at: new Date().toISOString(),
      kind: template.kind,
      payload: template.payload,
      tags: template.tags,
    };
    setInsights((prev) => [...prev, ins]);
    fetch("/api/insight", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: ins.kind,
        payload: ins.payload,
        tags: ins.tags,
        scene_id: ins.scene_id,
      }),
    }).catch(() => {});
  }

  function pickChoice(choiceId: string) {
    if (pickedChoiceIds.has(choiceId)) return;
    const choice = scene.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    setPickedChoiceIds((prev) => new Set(prev).add(choiceId));
    if (choice.insight) {
      addInsight({
        kind: choice.insight.kind,
        payload: choice.insight.payload,
        tags: choice.insight.tags,
      });
    }
  }

  function openLayerDrop() {
    if (!layerUnlocked || !scene.layer_drop) return;
    setLayerDropOpen(true);
  }

  function closeLayerDrop() {
    setLayerDropOpen(false);
    if (!layerDropVisited && scene.layer_drop?.on_return_insight) {
      addInsight({
        kind: scene.layer_drop.on_return_insight.kind,
        payload: scene.layer_drop.on_return_insight.payload,
        tags: scene.layer_drop.on_return_insight.tags,
      });
      setVisitedLayerDrops((prev) => new Set(prev).add(scene.id));
    }
  }

  function completeInterstitial() {
    const drop = scene.layer_drop;
    if (drop?.on_return_insight && !visitedLayerDrops.has(scene.id)) {
      addInsight({
        kind: drop.on_return_insight.kind,
        payload: drop.on_return_insight.payload,
        tags: drop.on_return_insight.tags,
      });
      setVisitedLayerDrops((prev) => new Set(prev).add(scene.id));
    }
    const target = drop?.interstitial?.advance_to;
    setLayerDropOpen(false);
    if (target) switchScene(target);
  }

  function openArtifact(id: string) {
    const artifact = scene.artifacts?.find((a) => a.id === id);
    if (!artifact) return;
    setOpenArtifactId(id);
    if (!revealedArtifactIds.has(id)) {
      setRevealedArtifactIds((prev) => new Set(prev).add(id));
      if (artifact.insight) {
        addInsight({
          kind: artifact.insight.kind,
          payload: artifact.insight.payload,
          tags: artifact.insight.tags,
        });
      }
    }
  }

  function closeArtifact() {
    setOpenArtifactId(null);
  }

  function submitInput(value: string) {
    const trimmed = value.trim();
    if (!scene.input || submittedInputIds.has(scene.input.id) || !trimmed) return;
    setSubmittedInputIds((prev) => new Set(prev).add(scene.input!.id));
    const payload = scene.input.insight.payload.replace(/\{\{value\}\}/g, trimmed);
    addInsight({
      kind: scene.input.insight.kind,
      payload,
      tags: scene.input.insight.tags,
    });
    if (scene.input.audio_on_submit) {
      const audio = new Audio(scene.input.audio_on_submit);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
  }

  function switchScene(id: string) {
    if (id === currentSceneId) return;
    setCurrentSceneId(id);
    setLayerDropOpen(false);
    setOpenArtifactId(null);
    setExportRevealOpen(false);
  }

  const sceneIndex = allScenes.findIndex((s) => s.id === scene.id);
  const prevScene = sceneIndex > 0 ? allScenes[sceneIndex - 1] : null;
  const nextScene =
    sceneIndex >= 0 && sceneIndex < allScenes.length - 1
      ? allScenes[sceneIndex + 1]
      : null;

  return (
    <div className={`${!!scene.theme && scene.theme !== "terminal" ? "" : "scanline"} min-h-dvh flex flex-col bg-bg text-fg`}>
      <header className="border-b border-rule px-6 py-3 flex items-center justify-between text-xs uppercase tracking-widest text-fg-muted">
        <div className="flex items-center gap-3">
          <span className="text-accent">æsh-eternal</span>
          <span>v0.0.1</span>
        </div>
        <div className="flex items-center gap-6">
          <span>insights: <span className="text-fg">{insights.length}</span></span>
          <span>scene: <span className="text-fg">{scene.id}</span></span>
          <span>session: <span className="text-fg">live</span></span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <ThreadPane scenes={allScenes} currentSceneId={scene.id} onSwitch={switchScene} />
        <ScenePane
          scene={scene}
          pickedChoiceIds={pickedChoiceIds}
          onPick={pickChoice}
          layerUnlocked={layerUnlocked}
          layerDropVisited={layerDropVisited}
          onOpenLayerDrop={openLayerDrop}
          revealedArtifactIds={revealedArtifactIds}
          onOpenArtifact={openArtifact}
          submittedInputIds={submittedInputIds}
          onSubmitInput={submitInput}
          clickedDesktopIconIds={clickedDesktopIconIds}
          onClickDesktopIcon={clickDesktopIcon}
          clickedPersonaIds={clickedPersonaIds}
          onClickPersona={clickPersona}
          onOpenExportReveal={() => setExportRevealOpen(true)}
        />
        <InventoryPane insights={insights} />
      </div>

      <footer className="border-t border-rule px-6 py-2 text-[10px] uppercase tracking-widest text-fg-muted flex items-center justify-between gap-4">
        <span className="flex-1 truncate hidden sm:block">
          API → /api/scene · /api/insight · /api/export · /api/advance
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => prevScene && switchScene(prevScene.id)}
            disabled={!prevScene}
            className="border border-rule px-3 py-1 hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-fg-muted disabled:cursor-not-allowed"
          >
            ‹ prev
          </button>
          <span className="text-fg">
            scene {sceneIndex + 1}/{allScenes.length}
          </span>
          <button
            onClick={() => nextScene && switchScene(nextScene.id)}
            disabled={!nextScene}
            className="border border-rule px-3 py-1 hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-fg-muted disabled:cursor-not-allowed"
          >
            next ›
          </button>
        </div>
        <span className="flex-1 text-right truncate hidden sm:block">
          esc to exit a layer · click choices to capture
        </span>
      </footer>

      {layerDropOpen && scene.layer_drop?.interstitial && (
        <ZorkInterstitial
          interstitial={scene.layer_drop.interstitial}
          onComplete={completeInterstitial}
        />
      )}

      {layerDropOpen && scene.layer_drop && !scene.layer_drop.interstitial && scene.layer_drop.service_url && (
        <LayerDropOverlay
          url={scene.layer_drop.service_url}
          label={scene.layer_drop.label}
          onClose={closeLayerDrop}
        />
      )}

      {openArtifactId && (() => {
        const artifact = scene.artifacts?.find((a) => a.id === openArtifactId);
        return artifact ? (
          <ArtifactModal artifact={artifact} onClose={closeArtifact} />
        ) : null;
      })()}

      {exportRevealOpen && (
        <ExportRevealModal
          format={scene.export_reveal?.format ?? "jsonl"}
          onClose={() => setExportRevealOpen(false)}
        />
      )}
    </div>
  );
}

function ThreadPane({
  scenes,
  currentSceneId,
  onSwitch,
}: {
  scenes: Scene[];
  currentSceneId: string;
  onSwitch: (id: string) => void;
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-rule px-4 py-5 text-xs">
      <div className="text-fg-muted uppercase tracking-widest mb-3">thread</div>
      <ol className="space-y-1">
        {scenes.map((s) => {
          const active = s.id === currentSceneId;
          return (
            <li key={s.id}>
              <button
                onClick={() => onSwitch(s.id)}
                className={
                  "w-full text-left py-1 transition-colors " +
                  (active
                    ? "text-accent"
                    : "text-fg-muted hover:text-fg")
                }
              >
                <div className="flex items-center gap-2">
                  <span>{active ? "▸" : "·"}</span>
                  <span className="truncate">{s.title}</span>
                </div>
                <div className="ml-4 text-[10px] uppercase tracking-widest opacity-70">
                  {s.era}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function ScenePane({
  scene,
  pickedChoiceIds,
  onPick,
  layerUnlocked,
  layerDropVisited,
  onOpenLayerDrop,
  revealedArtifactIds,
  onOpenArtifact,
  submittedInputIds,
  onSubmitInput,
  clickedDesktopIconIds,
  onClickDesktopIcon,
  clickedPersonaIds,
  onClickPersona,
  onOpenExportReveal,
}: {
  scene: Scene;
  pickedChoiceIds: Set<string>;
  onPick: (id: string) => void;
  layerUnlocked: boolean;
  layerDropVisited: boolean;
  onOpenLayerDrop: () => void;
  revealedArtifactIds: Set<string>;
  onOpenArtifact: (id: string) => void;
  submittedInputIds: Set<string>;
  onSubmitInput: (value: string) => void;
  clickedDesktopIconIds: Set<string>;
  onClickDesktopIcon: (id: string) => void;
  clickedPersonaIds: Set<string>;
  onClickPersona: (id: string) => void;
  onOpenExportReveal: () => void;
}) {
  const isThemed = !!scene.theme && scene.theme !== "terminal";
  const narrationClass = isThemed
    ? "hand space-y-5 text-3xl leading-snug max-w-3xl"
    : "hand text-fg space-y-5 text-3xl leading-snug max-w-3xl";

  return (
    <main
      data-theme={scene.theme ?? "terminal"}
      className="flex-1 min-w-0 px-10 py-8 overflow-y-auto"
    >
      {scene.desktop_icons && scene.desktop_icons.length > 0 && (
        <div className="desktop-icon-grid">
          {scene.desktop_icons.map((icon) => {
            const clicked = clickedDesktopIconIds.has(icon.id);
            return (
              <button
                key={icon.id}
                onClick={() => onClickDesktopIcon(icon.id)}
                className={"desktop-icon" + (clicked ? " clicked" : "")}
                aria-label={`Open ${icon.label}`}
              >
                <div className="desktop-icon-image" aria-hidden="true">
                  {icon.icon ? (
                    <img src={icon.icon} alt="" />
                  ) : (
                    icon.label[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <div className="desktop-icon-label">{icon.label}</div>
              </button>
            );
          })}
        </div>
      )}
      <div className="scene-wrapper">
        <div className="scene-titlebar">
          <span className="scene-titlebar-close" />
          <span className="scene-titlebar-title">Untitled-1</span>
        </div>
        <div className="scene-body">
      <div
        className={
          (isThemed ? "era-line" : "text-fg-muted uppercase tracking-widest text-xs") +
          " mb-1"
        }
      >
        {scene.era}
      </div>
      <h1
        className={
          isThemed
            ? "scene-title"
            : "text-accent text-3xl mb-8 tracking-tight"
        }
      >
        {scene.title}
      </h1>

      <div className={narrationClass}>
        {scene.narration.map((line, i) => (
          <p
            key={`${scene.id}-${i}`}
            style={{ animationDelay: `${i * 200}ms` }}
            className="opacity-0 animate-[fadeIn_400ms_ease-out_forwards]"
          >
            {renderEmphasis(line)}
          </p>
        ))}
      </div>

      {scene.ambient_embed && (
        <div className="mt-8 max-w-3xl">
          <div
            className={
              isThemed
                ? "section-label mb-2"
                : "text-fg-muted uppercase tracking-widest text-xs mb-2"
            }
          >
            {scene.ambient_embed.label}
          </div>
          <div className="ambient-embed">
            <iframe
              src={scene.ambient_embed.service_url}
              title={scene.ambient_embed.label}
              style={{ height: `${scene.ambient_embed.height ?? 360}px` }}
              sandbox="allow-scripts allow-same-origin"
              className="ambient-embed-frame"
            />
          </div>
        </div>
      )}

      {scene.personas && scene.personas.length > 0 && (
        <div className="mt-10">
          <div className="hex-flower">
            {scene.personas.map((p) => {
              const clicked = clickedPersonaIds.has(p.id);
              return (
                <button
                  key={p.id}
                  data-position={p.position}
                  className={"hex-card" + (clicked ? " clicked" : "")}
                  onClick={() => onClickPersona(p.id)}
                  disabled={p.is_center || clicked}
                  aria-label={p.name}
                >
                  <div className="hex-card-inner">
                    {p.sigil && (
                      <div className="hex-card-sigil">{p.sigil}</div>
                    )}
                    <div className="hex-card-name">{p.name}</div>
                    <div className="hex-card-tagline">{p.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {scene.choices.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <div
            className={
              isThemed
                ? "section-label mb-3"
                : "text-fg-muted uppercase tracking-widest text-xs mb-3"
            }
          >
            what do you do?
          </div>
          <div className="grid gap-2">
            {scene.choices.map((c) => {
              const picked = pickedChoiceIds.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c.id)}
                  disabled={picked}
                  className={
                    "text-left px-4 py-3 border transition-colors " +
                    (picked
                      ? "border-accent-dim text-fg-muted cursor-default"
                      : "border-rule text-fg hover:border-accent hover:text-accent")
                  }
                >
                  <span className="text-fg-muted mr-2">›</span>
                  {c.label}
                  {picked && (
                    <span className="ml-3 text-[10px] uppercase tracking-widest text-accent-dim">
                      captured
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {scene.input && (
        <SceneInputForm
          input={scene.input}
          submitted={submittedInputIds.has(scene.input.id)}
          onSubmit={onSubmitInput}
          isThemed={isThemed}
        />
      )}

      {scene.layer_drop && (
        <div className="mt-8 pt-6 border-t border-rule">
          <div
            className={
              isThemed
                ? "section-label mb-3"
                : "text-fg-muted uppercase tracking-widest text-xs mb-3"
            }
          >
            layer drop
          </div>
          <button
            onClick={onOpenLayerDrop}
            disabled={!layerUnlocked}
            className={
              "px-4 py-3 border w-full text-left " +
              (!layerUnlocked
                ? "border-rule text-fg-muted cursor-not-allowed"
                : layerDropVisited
                ? "border-accent-dim text-fg-muted hover:border-accent hover:text-accent"
                : "border-warn text-warn hover:bg-warn/5")
            }
          >
            <span className="mr-2">{!layerUnlocked ? "🔒" : layerDropVisited ? "↻" : "▼"}</span>
            {!layerUnlocked
              ? "[locked — make a choice to unlock]"
              : `> ${scene.layer_drop.label}${layerDropVisited ? " (revisit)" : ""}`}
          </button>
        </div>
      )}

      {scene.artifacts && scene.artifacts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-rule">
          <div
            className={
              isThemed
                ? "section-label mb-3"
                : "text-fg-muted uppercase tracking-widest text-xs mb-3"
            }
          >
            artifacts
          </div>
          <div className="flex flex-wrap gap-2">
            {scene.artifacts.map((a) => {
              const revealed = revealedArtifactIds.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => onOpenArtifact(a.id)}
                  className={
                    "px-3 py-2 border text-left text-xs flex items-center gap-2 transition-colors " +
                    (revealed
                      ? "border-accent-dim text-fg-muted hover:border-accent hover:text-accent"
                      : "border-rule text-fg hover:border-accent hover:text-accent")
                  }
                >
                  <span>{a.kind === "pdf" ? "📄" : "📰"}</span>
                  <span>{a.caption}</span>
                  {revealed && (
                    <span className="text-[10px] uppercase tracking-widest text-accent-dim ml-1">
                      seen
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {scene.export_reveal && (
        <div className="mt-10 max-w-3xl">
          <button onClick={onOpenExportReveal} className="export-reveal-button">
            ▸ {scene.export_reveal.button_label}
          </button>
        </div>
      )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function SceneInputForm({
  input,
  submitted,
  onSubmit,
  isThemed,
}: {
  input: SceneInputT;
  submitted: boolean;
  onSubmit: (value: string) => void;
  isThemed: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <div className="mt-10 pt-6 border-t border-rule max-w-3xl">
      <form onSubmit={handleSubmit}>
        <label
          htmlFor={input.id}
          className={
            isThemed
              ? "section-label block mb-2"
              : "block text-fg-muted uppercase tracking-widest text-xs mb-3"
          }
        >
          {input.label}
        </label>
        <div className="flex gap-2">
          <input
            id={input.id}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={input.placeholder}
            disabled={submitted}
            autoComplete="off"
            className={
              isThemed
                ? "flex-1"
                : "flex-1 bg-bg-elev border border-rule px-4 py-3 text-fg font-mono focus:outline-none focus:border-accent disabled:opacity-50"
            }
          />
          <button
            type="submit"
            disabled={submitted || !value.trim()}
            className={
              isThemed
                ? ""
                : "px-6 py-3 border border-accent text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-rule disabled:text-fg-muted"
            }
          >
            {submitted ? "captured" : (input.submit_label ?? "submit")}
          </button>
        </div>
        {submitted && (
          <div
            className={
              isThemed
                ? "section-label mt-3"
                : "mt-3 text-[10px] uppercase tracking-widest text-accent-dim"
            }
          >
            captured to insights
          </div>
        )}
      </form>
    </div>
  );
}

function InventoryPane({ insights }: { insights: Insight[] }) {
  return (
    <aside className="w-80 shrink-0 border-l border-rule px-4 py-5 overflow-y-auto">
      <div className="text-fg-muted uppercase tracking-widest text-xs mb-3 flex items-center justify-between">
        <span>insights</span>
        <span className="text-accent">{insights.length}</span>
      </div>
      {insights.length === 0 ? (
        <p className="text-fg-muted text-xs italic">
          insights appear here as you play. they export as training data for your clone.
        </p>
      ) : (
        <ul className="space-y-3">
          {insights.map((i) => (
            <li key={i.id} className="border border-rule p-3 bg-bg-elev">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] uppercase tracking-widest ${KIND_COLOR[i.kind]}`}>
                  {KIND_LABEL[i.kind]}
                </span>
                <span className="text-[10px] text-fg-muted font-mono">
                  {i.id.slice(0, 6)}
                </span>
              </div>
              <p className="text-xs text-fg leading-relaxed">{i.payload}</p>
              {i.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {i.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] uppercase tracking-widest text-fg-muted border border-rule px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function ArtifactModal({
  artifact,
  onClose,
}: {
  artifact: Artifact;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between border-b border-rule px-6 py-3 text-xs uppercase tracking-widest">
        <span className="text-accent">artifact · {artifact.caption}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-fg-muted hover:text-accent border border-rule px-3 py-1"
        >
          ↩ close
        </button>
      </div>
      <div
        className="flex-1 flex p-8 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {artifact.kind === "pdf" ? (
          <iframe
            src={artifact.src}
            title={artifact.caption}
            className="flex-1 w-full min-h-[80vh] bg-white border border-rule"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artifact.src}
            alt={artifact.alt ?? artifact.caption}
            className="max-w-full max-h-full object-contain border border-rule m-auto"
          />
        )}
      </div>
    </div>
  );
}

function ExportRevealModal({
  format,
  onClose,
}: {
  format: "jsonl" | "json";
  onClose: () => void;
}) {
  const [content, setContent] = useState<string>("fetching /api/export …");

  useEffect(() => {
    fetch(`/api/export?format=${format}`)
      .then((r) => r.text())
      .then((t) => setContent(t || "(empty — no insights captured yet)"))
      .catch((e) => setContent(`error: ${e.message ?? e}`));
  }, [format]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between border-b border-rule px-6 py-3 text-xs uppercase tracking-widest">
        <span className="text-accent">
          GET /api/export?format={format} ·{" "}
          {format === "jsonl" ? "application/x-ndjson" : "application/json"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-fg-muted hover:text-accent border border-rule px-3 py-1"
        >
          ↩ close
        </button>
      </div>
      <pre
        className="flex-1 overflow-auto p-6 text-xs text-accent font-mono whitespace-pre-wrap break-all bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </pre>
    </div>
  );
}

function ZorkInterstitial({
  interstitial,
  onComplete,
}: {
  interstitial: Interstitial;
  onComplete: () => void;
}) {
  const [rendered, setRendered] = useState("");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let buf = "";
    const push = (t: string) => {
      buf += t;
      if (!cancelled) setRendered(buf);
    };

    async function play() {
      await sleep(500);
      for (const line of interstitial.lines) {
        if (cancelled) return;
        const text = line.mode === "command" ? `> ${line.text}` : line.text;
        if (line.mode === "command" || line.mode === "type") {
          for (const ch of text) {
            if (cancelled) return;
            push(ch);
            await sleep(24);
          }
          push("\n");
        } else {
          push(text + "\n");
        }
        await sleep(line.pause ?? 350);
      }
      if (!cancelled) setDone(true);
    }

    play();
    return () => {
      cancelled = true;
    };
  }, [interstitial]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [rendered, done]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col scanline">
      <div className="flex items-center justify-between border-b border-rule px-6 py-3 text-xs uppercase tracking-widest">
        <span className="text-accent">zork · the great underground empire</span>
        <button
          onClick={onComplete}
          className="text-fg-muted hover:text-accent border border-rule px-3 py-1"
        >
          skip »
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto px-8 py-6">
        <pre
          className="text-accent text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
          style={{ textShadow: "0 0 6px rgba(51, 255, 102, 0.45)", fontFamily: "var(--font-term), ui-monospace, monospace" }}
        >
          {rendered}
          {!done && (
            <span className="inline-block w-2 h-4 bg-accent align-[-0.1em] animate-[zblink_1s_step-end_infinite]" />
          )}
        </pre>
        {done && (
          <button
            onClick={onComplete}
            className="mt-10 border border-accent px-6 py-3 text-accent uppercase tracking-widest text-sm hover:bg-accent/10 transition-colors animate-[fadeIn_500ms_ease-out]"
          >
            {interstitial.continue_label ?? "continue"} ›
          </button>
        )}
      </div>
      <style>{`
        @keyframes zblink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

const LAYER_DROP_AUTO_RETURN_S = 12;

function LayerDropOverlay({
  url,
  label,
  onClose,
}: {
  url: string;
  label: string;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(LAYER_DROP_AUTO_RETURN_S);

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    const timeout = setTimeout(onClose, LAYER_DROP_AUTO_RETURN_S * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between border-b border-rule px-6 py-3 text-xs uppercase tracking-widest">
        <span className="text-accent">layer-drop · {label}</span>
        <div className="flex items-center gap-4">
          <span className="text-fg-muted">
            auto-return in <span className="text-accent">{remaining}s</span>
          </span>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-accent border border-rule px-3 py-1"
          >
            ↩ return to thread
          </button>
        </div>
      </div>
      <iframe
        src={url}
        title={label}
        className="flex-1 w-full bg-black"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
