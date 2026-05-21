#!/usr/bin/env node
/**
 * Konverterer `<modifier>:dark:<util>` → `dark:<modifier>:<util>` der
 * modifier kan være hover/focus/group-hover/x/etc. Bruk én gang etter
 * convert-dark-mode.mjs for å normalisere variant-rekkefølge.
 */

import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);

// Hver klasse er rundt whitespace eller string-grenser. Vi matcher
// rimelige modifier-tokens før `dark:` og bytter rekkefølge.
//
// Eksempler vi vil støtte:
//   hover:dark:bg-zinc-800     → dark:hover:bg-zinc-800
//   focus:dark:ring-zinc-700   → dark:focus:ring-zinc-700
//   group-hover/th:dark:text-x → dark:group-hover/th:text-x
//   supports-[backdrop-filter]:dark:bg-x → dark:supports-[...]:bg-x
//
// Vi tillater modifiers som inneholder "/", "[", "]", "-", "_", bokstaver.
const MODIFIER_PATTERN = /([a-zA-Z][\w/-]*(?:\[[^\]]+\])?[\w/-]*):dark:/g;

for (const filePath of files) {
  const abs = path.resolve(filePath);
  let src = fs.readFileSync(abs, "utf8");
  const before = src;
  // Iterer til ingen flere matches (i tilfelle av nestede modifiers).
  let prev;
  do {
    prev = src;
    src = src.replace(MODIFIER_PATTERN, "dark:$1:");
  } while (src !== prev);

  if (src === before) {
    console.log(`= ${filePath} (ingen endringer)`);
  } else {
    fs.writeFileSync(abs, src, "utf8");
    console.log(`✔ ${filePath}`);
  }
}
