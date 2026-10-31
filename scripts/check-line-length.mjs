import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Indica los archivos que quieres comprobar.");
  process.exit(2);
}

let violations = 0;
for (const file of files) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const length = [...line].length;
    if (length > 100) {
      console.error(`${file}:${index + 1}: ${length} caracteres (máximo 100)`);
      violations++;
    }
  }
}

if (violations > 0) process.exitCode = 1;
