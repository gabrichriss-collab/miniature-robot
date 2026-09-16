/**
 * Fjerner `require("server-only")` fra den kompilerte testutgaven.
 *
 * Pakka kaster med vilje naar den lastes utenfor en Server Component, og
 * det er nettopp den vakten vi vil ha i produksjon. Testene kjoerer
 * modulene direkte i Node, saa der maa kallet bort. Dette roerer bare
 * .test-out/ — aldri kildekoden eller produksjonsbygget.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith(".js")) {
      const src = readFileSync(f, "utf8");
      const out = src.replace(/require\("server-only"\);?/g, "");
      if (out !== src) writeFileSync(f, out);
    }
  }
};

walk(".test-out");
