"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./layer000.module.css";

const TURTLE = String.raw`
                              ______________________
                           ,-'                      '-,
                         ,'    ___     ___     ___     ',
                        /    ,'   '. ,'   '. ,'   '.     \
                       /    ( o   o X o   o X o   o )     \
                      |      '.___.'  '.___.'  '.___.'     |
                      |     .--------------------------.    |
                      |     |       I   <3   CT        |    |
                      |     '--------------------------'    |
                       \                                   /
                        '-,_____________________________,-'
            .--"""""--.     /                          \
           /  (O)-(O)  \___/                            \____
          |    ------   |                                    >===---
          |    ~~~~~~   |                                   /
           \           /                                   /
            '---------'_______________________________ ___/
                        | |              | |        | |
                        | |              | |        | |
                       _| |_            _| |_      _| |_
                      /___ \           /___ \     /___ \
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Terminal() {
  const screenRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLPreElement>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [buffer, setBuffer] = useState("");
  const awaitingInput = useRef(false);

  function append(text: string) {
    if (outRef.current) outRef.current.textContent += text;
    if (screenRef.current) screenRef.current.scrollTop = screenRef.current.scrollHeight;
  }

  async function printLine(line: string, delayAfter = 90) {
    append(line + "\n");
    if (delayAfter > 0) await sleep(delayAfter);
  }

  async function typeLine(line: string, charDelay = 28) {
    for (const ch of line) {
      append(ch);
      if (charDelay > 0) await sleep(charDelay);
    }
    append("\n");
  }

  async function submitCommand(cmd: string) {
    awaitingInput.current = false;
    append(`> ${cmd}\n`);
    setBuffer("");

    if (!cmd.trim()) {
      awaitingInput.current = true;
      return;
    }
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      for (const line of data.output || []) append(line + "\n");
    } catch (e) {
      append(`error: ${e instanceof Error ? e.message : String(e)}\n`);
    }
    awaitingInput.current = true;
    if (screenRef.current) screenRef.current.scrollTop = screenRef.current.scrollHeight;
  }

  // Boot sequence — run once on mount.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      let banner: string[] = [];
      try {
        const res = await fetch("/api/boot");
        const data = await res.json();
        banner = data.banner || [];
      } catch (e) {
        banner = [`ERROR: boot endpoint unreachable (${e instanceof Error ? e.message : String(e)})`];
      }
      if (cancelled) return;

      await sleep(400);
      for (const line of banner) {
        if (cancelled) return;
        await printLine(line, 75 + Math.random() * 110);
      }
      await sleep(900);
      append("\n\n");
      await sleep(300);

      if (cancelled) return;
      await typeLine("WELCOME TO LAYER-000", 38);
      await sleep(450);
      append(TURTLE + "\n");
      await sleep(450);
      if (cancelled) return;

      setPromptVisible(true);
      awaitingInput.current = true;
      if (screenRef.current) screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keyboard input.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!awaitingInput.current) return;
      if (e.key === "Enter") {
        e.preventDefault();
        setBuffer((b) => {
          submitCommand(b);
          return "";
        });
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setBuffer((b) => b.slice(0, -1));
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setBuffer((b) => b + e.key);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.crt}>
      <div className={styles.screen} ref={screenRef}>
        <pre className={styles.output} ref={outRef} />
        <div className={styles.promptLine} hidden={!promptVisible}>
          <span className={styles.prompt}>&gt;&nbsp;</span>
          <span className={styles.input}>{buffer}</span>
          <span className={styles.cursor} />
        </div>
      </div>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
    </div>
  );
}
