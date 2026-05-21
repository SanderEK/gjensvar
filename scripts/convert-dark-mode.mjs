#!/usr/bin/env node
/**
 * Konverterer hardkodet dark-mode Tailwind-klasser til lys/mørk-par.
 * Kjøres via:
 *   node scripts/convert-dark-mode.mjs <fil-bane> [...flere filer]
 *
 * Strategien:
 *  - Finner alle "klassestrenger" i filen (innenfor "..." eller `...`).
 *  - For hver klasse i strengen:
 *      - Hvis klassen allerede har `dark:`-prefix → la den være.
 *      - Hvis klassen er en zinc-mappet bg/border/text/ring → produserer en
 *        lys variant + `dark:` variant av originalen.
 *  - Beholder modifiers (`hover:`, `focus:`, `disabled:`, `group-hover/x:`,
 *    `supports-[...]:` osv.) på begge variantene.
 */

import fs from "node:fs";
import path from "node:path";

// "lys" motstykke per zinc-shade. Holder midten (500/600) som er
// modus-uavhengig i de fleste UI-er (sekundærtekst, ikoner).
const ZINC_LIGHT = {
  50: "900",
  100: "900",
  200: "800",
  300: "700",
  400: "600",
  500: "500",
  600: "500",
  700: "300",
  800: "200",
  900: "100",
  950: "white",
};

const TARGET_PROPERTIES = new Set([
  "bg",
  "text",
  "border",
  "ring",
  "divide",
  "from",
  "to",
  "via",
  "fill",
  "stroke",
  "placeholder",
  "decoration",
  "outline",
  "shadow",
  "accent",
]);

function lightZincToken(prop, shade, suffix) {
  const lightShade = ZINC_LIGHT[shade];
  if (lightShade == null) return null;
  // bg-zinc-950 → bg-white. Andre kombinasjoner: bg-white finnes også.
  if (lightShade === "white") {
    if (suffix) return `${prop}-white${suffix}`;
    return `${prop}-white`;
  }
  if (suffix) return `${prop}-zinc-${lightShade}${suffix}`;
  return `${prop}-zinc-${lightShade}`;
}

/**
 * Transformerer én klasse. Returnerer enten samme klasse, eller
 * "<lightVariant> <originalKlasse-med-dark:>".
 */
function transformClass(cls) {
  if (!cls) return cls;
  // Allerede dark: → la stå.
  if (/(^|:)dark:/.test(cls)) return cls;

  // Splitt på siste ":" for å separere modifiers fra utility.
  const lastColon = cls.lastIndexOf(":");
  const modifiers = lastColon === -1 ? "" : cls.slice(0, lastColon + 1);
  const util = lastColon === -1 ? cls : cls.slice(lastColon + 1);

  // Vi støtter kun zinc-skalaen + "bg-black".
  // Match `<prop>-zinc-<shade>(/<opacity>)?`
  const zincMatch = util.match(
    /^(bg|text|border|ring|divide|from|to|via|fill|stroke|placeholder|decoration|outline|shadow|accent)-zinc-(\d{2,3})(\/\d+|\/\[[^\]]+\])?$/
  );
  if (zincMatch) {
    const prop = zincMatch[1];
    const shade = zincMatch[2];
    const suffix = zincMatch[3] || "";
    if (!TARGET_PROPERTIES.has(prop)) return cls;
    const light = lightZincToken(prop, shade, suffix);
    if (!light) return cls;
    return `${modifiers}${light} ${modifiers}dark:${util}`;
  }

  // bg-black → bg-white dark:bg-black
  if (util === "bg-black") {
    return `${modifiers}bg-white ${modifiers}dark:bg-black`;
  }
  // text-white → text-zinc-900 dark:text-white (men bare på ren text-white)
  if (util === "text-white") {
    return `${modifiers}text-zinc-900 ${modifiers}dark:text-white`;
  }

  return cls;
}

function transformClassString(str) {
  // Splitt på whitespace, transformer hver klasse, joinet tilbake.
  const tokens = str.split(/(\s+)/);
  return tokens
    .map((t) => {
      if (/^\s+$/.test(t) || t === "") return t;
      return transformClass(t);
    })
    .join("");
}

/**
 * Finn alle string-literals (innenfor "..." eller '...' eller `...`) som
 * inneholder Tailwind-lignende klasser, og transformer innholdet.
 *
 * Vi er ikke en TS-parser – vi bruker en pragmatisk regex som matcher
 * strenger og transformerer innholdet hvis det inneholder kjente
 * tailwind-tokens.
 */
function transformFile(source) {
  // Strenger: "....", '....', `....` (uten support for nested template literals)
  const stringRegex = /(["'`])((?:\\.|(?!\1).)*?)\1/g;
  return source.replace(stringRegex, (match, quote, content) => {
    if (!/(bg-zinc-|text-zinc-|border-zinc-|ring-zinc-|bg-black|text-white)/.test(content)) {
      return match;
    }
    const transformed = transformClassString(content);
    return `${quote}${transformed}${quote}`;
  });
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node convert-dark-mode.mjs <file> [...]");
  process.exit(1);
}

for (const filePath of files) {
  const abs = path.resolve(filePath);
  const src = fs.readFileSync(abs, "utf8");
  const out = transformFile(src);
  if (out === src) {
    console.log(`= ${filePath} (ingen endringer)`);
    continue;
  }
  fs.writeFileSync(abs, out, "utf8");
  console.log(`✔ ${filePath}`);
}
