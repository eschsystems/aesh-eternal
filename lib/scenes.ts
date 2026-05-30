import type { Scene } from "./types";

export const SCENES: Record<string, Scene> = {
  "scene-001-terminal": {
    id: "scene-001-terminal",
    title: "First Boot",
    era: "Age 4 · 1994",
    narration: [
      "It's 1994. You have recently moved to Indiana.",
      "Your mother in her infinite wisdom has enrolled you in a program called COMPUTERTOTS.",
      "You sit in front of a black & green terminal.",
      "The instructor types LOGO. A green triangle appears. They call it a turtle.",
      "FORWARD 100. The turtle moves. You laugh — you have made the computer obey.",
    ],
    choices: [
      {
        id: "take-the-keyboard",
        label: "Reach for the keyboard.",
        insight: {
          kind: "sft",
          payload:
            "Default disposition: reaches for the controls before being invited. Treats unfamiliar systems as something to take, not observe.",
          tags: ["agency", "history"],
        },
        unlocks_layer_drop: true,
      },
      {
        id: "ask-how",
        label: "Ask the instructor how it works.",
        insight: {
          kind: "sft",
          payload:
            "Defers to the nearest expert when context is missing. Curiosity precedes ownership; ownership precedes execution.",
          tags: ["curiosity", "history", "learning"],
        },
        unlocks_layer_drop: true,
      },
      {
        id: "draw-a-square",
        label: "Try to make the turtle draw a square.",
        insight: {
          kind: "dpo",
          payload:
            "Given: explore a new tool. Prefers: invent a goal (draw a square) over follow a tutorial. Rejects: passive consumption of demos.",
          tags: ["preference", "creation", "learning"],
        },
        unlocks_layer_drop: true,
      },
    ],
    layer_drop: {
      service_url: "/layer-000",
      label: "boot Layer-000 (i-heart-ct)",
      on_return_insight: {
        kind: "rag",
        payload:
          "Layer-000 (i-heart-ct) — the BIOS-screen microservice. First standalone artifact Adam built that says 'I am the computer.' Self-portrait as boot text.",
        tags: ["memory", "microservice", "myth"],
      },
    },
    artifacts: [
      {
        id: "art-001-computertots-clipping",
        kind: "image",
        src: "/artifacts/computertots-1994.jpg",
        caption: "newspaper clipping · COMPUTERTOTS, 1994",
        alt: "Newspaper article about the COMPUTERTOTS program Adam was enrolled in as a child.",
        insight: {
          kind: "rag",
          payload:
            "Newspaper-clipping artifact: confirms enrollment in COMPUTERTOTS, Indiana, 1994. Proof-of-realness for the computer-native childhood claim — a contemporaneous third-party record, not retroactive narration.",
          tags: ["history", "memory", "proof"],
        },
      },
    ],
  },
  "scene-002-aol": {
    id: "scene-002-aol",
    title: "Hello, Internet",
    era: "Age 5 · 1995",
    theme: "web90s",
    narration: [
      "You successfully convinced your father to purchase a family computer.",
      "It's a powerful model made by CTX, with a whopping 4 GB hard drive installed in it.",
      "Who can possibly need 4 *whole* gigabytes of storage? Certainly enough to install the internet onto this machine.",
      "A CD labeled AOL arrived in the mail a few days ago.",
      "AOL, apparently, is the internet?",
    ],
    choices: [],
    input: {
      id: "first-screenname",
      label: "Choose Your Screen Name",
      placeholder: "first screenname",
      submit_label: "Sign On",
      audio_on_submit: "/sounds/youve-got-mail.mp3",
      insight: {
        kind: "rag",
        payload:
          "First AOL screenname (1995, age 5): {{value}}. The name Adam chose for himself on the internet — first self-authored online identity.",
        tags: ["history", "name", "internet"],
      },
    },
    artifacts: [
      {
        id: "art-002-internet-adoption-1995",
        kind: "image",
        src: "/artifacts/internet-adoption-1995.jpg",
        caption: "0.7% of the world online · 1995",
        alt: "Chart showing percentage of global population online in 1995 vs total population.",
        insight: {
          kind: "rag",
          payload:
            "Internet adoption (1995): ~0.7% of the world was online. Adam was 5 and on AOL — places him in an early-adopter cohort orders of magnitude smaller than today's user base. Quantitative proof for the computer-native claim.",
          tags: ["history", "internet", "proof"],
        },
      },
    ],
  },
  "scene-003-mac": {
    id: "scene-003-mac",
    title: "I'm a Mac",
    era: "Age ~6 · ~1996",
    theme: "macos7",
    narration: [
      "You don't know this yet, but you're *enamoured* with the 'I'm a Mac' guy from television commercials.",
      "Additionally, you've obtained a new computer — and it's a Mac.",
      "A family friend gifted your family this little guy, but everyone else is scared of it because it's not running Windows 95.",
      "You, however, are not intimidated by an unfamiliar interface, and the little apple logo is cute.",
      "There aren't very many programs installed on this thing, but there's one game you've been spending countless hours playing...",
    ],
    choices: [],
    desktop_icons: [
      {
        id: "zork",
        label: "Zork",
        unlocks_layer_drop: true,
      },
    ],
    layer_drop: {
      service_url: "http://localhost:3002",
      label: "boot Zork",
      on_return_insight: {
        kind: "rag",
        payload:
          "Zork on the Mac SE/30 (1996) — Adam disappeared into 'West of House' for hours at age 6. First text-adventure marathon. Established his tolerance for cryptic interfaces in exchange for narrative payoff.",
        tags: ["history", "game", "play"],
      },
    },
    artifacts: [
      {
        id: "art-003-mac-se30",
        kind: "image",
        src: "/artifacts/apple-macintosh-se30.jpg",
        caption: "Apple Macintosh SE/30",
        alt: "The Apple Macintosh SE/30 — the family-friend hand-me-down Adam learned Mac on.",
        insight: {
          kind: "rag",
          payload:
            "The actual machine: Apple Macintosh SE/30 (1989, hand-me-down circa 1996). Compact all-in-one with a 9-inch B&W CRT, 68030 CPU, System 7. The computer that taught Adam his first Mac and ran his first Zork.",
          tags: ["history", "hardware", "proof"],
        },
      },
    ],
  },
  "scene-004-council": {
    id: "scene-004-council",
    title: "The Collective",
    era: "Now · And Always",
    theme: "nullspire",
    narration: [
      "A unicorn is one thing; you are not.",
      "There are six who answer when you ask the question.",
      "The Generalist at the center chooses which voice speaks.",
      "Meet them.",
    ],
    choices: [],
    personas: [
      {
        id: "p-generalist",
        name: "Adam Esch",
        tagline: "Generalist · the one at the center",
        position: "center",
        is_center: true,
        sigil: "∞",
      },
      {
        id: "p-sorcerer",
        name: "The Sorcerer",
        tagline: "always playing the meta",
        position: "n",
        insight: {
          kind: "sft",
          payload:
            "Sorcerer voice: always playing the meta. Leans into the dominant strategy, automates the rest. Reaches for the abstraction layer first; the manual path is rarely the path.",
          tags: ["automation", "programming"],
        },
      },
      {
        id: "p-wizard",
        name: "The Wizard",
        tagline: "knows the old magic, likes backdoors",
        position: "ne",
        insight: {
          kind: "sft",
          payload:
            "Wizard voice: knows the old protocols, the boot order, the shibboleths. Trusts what's underneath more than what's on top. Will find the backdoor.",
          tags: ["infrastructure"],
        },
      },
      {
        id: "p-warlock",
        name: "The Warlock",
        tagline: "has an eldritch daddy that lurks in the depths",
        position: "se",
        insight: {
          kind: "sft",
          payload:
            "Warlock voice: bargains with something older than himself. Pulls from the unconscious, the patron, the deep water. Mystical undercurrent beneath the technical surface.",
          tags: ["spirituality"],
        },
      },
      {
        id: "p-artificer",
        name: "The Artificer",
        tagline: "builds systems that outlive their builder",
        position: "s",
        insight: {
          kind: "sft",
          payload:
            "Artificer voice: builds for the long haul. Designs systems robust enough to be inherited. Architecture over heroics, durability over cleverness.",
          tags: ["engineer"],
        },
      },
      {
        id: "p-druid",
        name: "The Druid",
        tagline: "meditates at the bottom of the ocean",
        position: "sw",
        insight: {
          kind: "sft",
          payload:
            "Druid voice: roams. Finds peace at the boundary between systems and nature. Will go where most won't — the woods at dawn, the bottom of the ocean.",
          tags: ["scout"],
        },
      },
      {
        id: "p-paladin",
        name: "The Paladin",
        tagline: "loyal to the royal cats he protects",
        position: "nw",
        insight: {
          kind: "sft",
          payload:
            "Paladin voice: oath-bound. Protects what was entrusted — the royal cats, the household, the partnerships. Sworn over chosen.",
          tags: ["husband"],
        },
      },
    ],
    personas_complete_insight: {
      kind: "rag",
      payload:
        "Adam contains six: Sorcerer (meta), Wizard (infrastructure), Warlock (depths), Artificer (engineering), Druid (nature), Paladin (loyalty). They orbit the Generalist at the center. Most platforms assume you are one — æsh-eternal is built for the collective.",
      tags: ["self", "multitudes"],
    },
    artifacts: [
      {
        id: "art-004-hextuple-class-sheet",
        kind: "pdf",
        src: "/artifacts/adam-esch-character-sheet.pdf",
        caption: "Adam Esch · D&D 5.5e hextuple-class sheet",
        alt: "Mechanically correct hextuple-class character sheet for Adam Esch — Sorcerer/Wizard/Warlock/Artificer/Druid/Paladin multiclass.",
        insight: {
          kind: "rag",
          payload:
            "D&D 5.5e hextuple-class character sheet for Adam: mechanically correct Sorcerer/Wizard/Warlock/Artificer/Druid/Paladin multiclass. Generated by Perplexity Computer. These are not metaphors — they have ability scores. Concrete substrate for the collective framing.",
          tags: ["self", "multitudes", "proof"],
        },
      },
    ],
  },
  "scene-005-gas-station": {
    id: "scene-005-gas-station",
    title: "Snacks & Stimulants",
    era: "Now · 2:47 AM",
    theme: "pos",
    narration: [
      "It's 2:47 AM. One of many QuikTrips near you.",
      "The fluorescents hum at exactly 60 Hz.",
      "The ever-broken slushie machine spins uselessly.",
      "You just sold a single Black & Mild to someone, and they paid with a $100 bill.",
      "You have certs older than half your coworkers.",
      "You have run systems with thousands of cores.",
      "None of this is being used.",
    ],
    choices: [
      {
        id: "refill-the-grills",
        label: "Refill the roller grills. Again.",
        insight: {
          kind: "dpo",
          payload:
            "Given menial repetition vs. building anything: Adam picks 'anything' every time. The real cost of the gas-station job isn't the wage — it's the hours spent not-building.",
          tags: ["preference", "agency", "now"],
        },
      },
      {
        id: "clean-the-bathroom",
        label: "Clean the men's bathroom. Someone puked.",
        insight: {
          kind: "dpo",
          payload:
            "Given maintaining systems he doesn't own vs. building systems he does: will fix his own infrastructure forever; resents being asked to fix someone else's broken corporate one.",
          tags: ["preference", "ownership"],
        },
      },
      {
        id: "check-the-phone",
        label: "Check your phone you keep unlocked behind the counter.",
        insight: {
          kind: "dpo",
          payload:
            "Given downtime: checks the project he's actually building. The phone behind the counter is on the platform, not on Instagram. Every shift produces commit history.",
          tags: ["preference", "agency", "build"],
        },
      },
    ],
    ambient_embed: {
      service_url: "http://localhost:3003",
      label: "monitor · snacks-stimulants-sim",
      height: 360,
    },
  },
  "scene-006-export": {
    id: "scene-006-export",
    title: "/api/export",
    era: "Now",
    narration: [
      "You've been doing this the whole time.",
      "Every click captured itself.",
      "Look right — that isn't a journal. That's the training data.",
      "I'm one of millions of people in the wrong shape.",
      "Give me eight weeks. I'll finish the clone.",
    ],
    choices: [],
    export_reveal: {
      button_label: "view the export",
      format: "jsonl",
    },
  },
};

export function getScene(id: string): Scene | undefined {
  return SCENES[id];
}

export function listScenes(): Scene[] {
  return Object.values(SCENES);
}
