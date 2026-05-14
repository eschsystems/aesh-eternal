export type InsightKind = "rag" | "sft" | "dpo";

export type Insight = {
  id: string;
  kind: InsightKind;
  payload: string;
  tags: string[];
  scene_id: string;
  created_at: string;
};

export type InsightTemplate = {
  kind: InsightKind;
  payload: string;
  tags: string[];
};

export type Choice = {
  id: string;
  label: string;
  insight?: InsightTemplate;
  advance_to?: string;
  unlocks_layer_drop?: boolean;
};

export type LayerDrop = {
  service_url: string;
  label: string;
  on_return_insight?: InsightTemplate;
};

export type AmbientEmbed = {
  service_url: string;
  label: string;
  height?: number;
};

export type ExportReveal = {
  button_label: string;
  format?: "jsonl" | "json";
};

export type Artifact = {
  id: string;
  kind: "image" | "pdf";
  src: string;
  caption: string;
  alt?: string;
  insight?: InsightTemplate;
};

export type SceneTheme = "terminal" | "web90s" | "macos7" | "nullspire" | "pos";

export type DesktopIcon = {
  id: string;
  label: string;
  icon?: string;
  unlocks_layer_drop?: boolean;
};

export type HexPosition = "center" | "n" | "ne" | "se" | "s" | "sw" | "nw";

export type Persona = {
  id: string;
  name: string;
  tagline: string;
  position: HexPosition;
  is_center?: boolean;
  sigil?: string;
  insight?: InsightTemplate;
};

export type SceneInput = {
  id: string;
  label: string;
  placeholder?: string;
  submit_label?: string;
  audio_on_submit?: string;
  unlocks_layer_drop?: boolean;
  insight: InsightTemplate;
};

export type Scene = {
  id: string;
  title: string;
  era: string;
  theme?: SceneTheme;
  narration: string[];
  choices: Choice[];
  layer_drop?: LayerDrop;
  artifacts?: Artifact[];
  input?: SceneInput;
  desktop_icons?: DesktopIcon[];
  personas?: Persona[];
  personas_complete_insight?: InsightTemplate;
  ambient_embed?: AmbientEmbed;
  export_reveal?: ExportReveal;
};

export type ExportBundle = {
  rag: Insight[];
  sft: Insight[];
  dpo: Insight[];
  generated_at: string;
};
