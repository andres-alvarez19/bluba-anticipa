import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const files = [];

for (const root of ["apps", "packages"]) {
  collect(root);
}

for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (text.includes("\t")) {
    throw new Error(`${file} contains tabs`);
  }
}

console.log("workspace lint ok");

function collect(path) {
  for (const entry of readdirSync(path)) {
    const child = join(path, entry);
    if (entry === "node_modules" || entry === "dist") {
      continue;
    }
    if (statSync(child).isDirectory()) {
      collect(child);
      continue;
    }
    if (/\.(ts|tsx|json)$/.test(child)) {
      files.push(child);
    }
  }
}
