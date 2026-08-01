import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { cleanPageText, commandExists } from "./lib.mjs";

function extractWithPdftotext(file) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bayan-pdf-"));
  const output = path.join(tempDir, "output.txt");

  try {
    execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", file, output], {
      stdio: "pipe",
    });

    const text = fs.readFileSync(output, "utf8");
    const pages = text.split("\f").map(cleanPageText);

    while (pages.length > 0 && pages.at(-1) === "") {
      pages.pop();
    }

    return {
      extractor: "pdftotext",
      pages,
      warnings: [],
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function decodeLiteral(value) {
  return value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, octal) =>
      String.fromCharCode(parseInt(octal, 8)),
    );
}

function extractFallback(file, expectedPages) {
  const buffer = fs.readFileSync(file);
  const source = buffer.toString("latin1");
  const literals = [];

  for (const match of source.matchAll(/\((?:\\.|[^\\()])*\)\s*Tj/g)) {
    const literal = match[0].replace(/\)\s*Tj$/, "").slice(1);
    literals.push(decodeLiteral(literal));
  }

  for (const match of source.matchAll(/\[(.*?)\]\s*TJ/gs)) {
    const group = match[1];
    const parts = [...group.matchAll(/\((?:\\.|[^\\()])*\)/g)].map((entry) =>
      decodeLiteral(entry[0].slice(1, -1)),
    );
    if (parts.length) literals.push(parts.join(""));
  }

  const joined = cleanPageText(literals.join("\n"));
  const count = Math.max(1, Number(expectedPages ?? 1));
  const pages = Array.from({ length: count }, () => "");
  if (joined) pages[0] = joined;

  return {
    extractor: "pdf-literal-string-scan-v1",
    pages,
    warnings: [
      "pdftotext was not available; fallback extraction quality may be limited.",
    ],
  };
}

export function extractPdfText(file, expectedPages) {
  if (commandExists("pdftotext")) {
    return extractWithPdftotext(file);
  }
  return extractFallback(file, expectedPages);
}
