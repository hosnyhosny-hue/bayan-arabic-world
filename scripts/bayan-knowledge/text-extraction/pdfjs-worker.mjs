import fs from "node:fs";
import path from "node:path";

const [, , pdfFile, outputFile] = process.argv;

if (!pdfFile || !outputFile) {
  console.error("Usage: node pdfjs-worker.mjs <pdf-file> <output-json>");
  process.exit(1);
}

function cleanText(value = "") {
  return String(value)
    .replace(/\u0000/g, "")
    .replace(/\u00ad/g, "")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2069]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function reconstructPage(items = []) {
  const tokens = items
    .filter((item) => typeof item?.str === "string")
    .map((item) => ({
      text: cleanText(item.str),
      x: Number(item.transform?.[4] ?? 0),
      y: Number(item.transform?.[5] ?? 0),
      width: Number(item.width ?? 0),
      height: Number(item.height ?? 0),
      hasEOL: Boolean(item.hasEOL),
    }))
    .filter((item) => item.text);

  if (tokens.length === 0) return "";

  tokens.sort((a, b) => {
    const tolerance = Math.max(
      2.5,
      Math.min(a.height || 8, b.height || 8) * 0.5,
    );

    if (Math.abs(a.y - b.y) > tolerance) {
      return b.y - a.y;
    }

    return a.x - b.x;
  });

  const lines = [];
  let currentLine = [];
  let currentY = tokens[0].y;

  for (const token of tokens) {
    const tolerance = Math.max(2.5, (token.height || 8) * 0.55);

    if (
      currentLine.length > 0 &&
      Math.abs(token.y - currentY) > tolerance
    ) {
      lines.push(currentLine);
      currentLine = [];
      currentY = token.y;
    }

    currentLine.push(token);

    if (token.hasEOL) {
      lines.push(currentLine);
      currentLine = [];
      currentY = token.y;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  const rendered = lines.map((line) => {
    const arabicCharacters = line.reduce(
      (total, token) =>
        total + (token.text.match(/[\u0600-\u06ff]/g) ?? []).length,
      0,
    );

    const allLetters = line.reduce(
      (total, token) =>
        total +
        (token.text.match(/[A-Za-z\u0600-\u06ff]/g) ?? []).length,
      0,
    );

    const isArabicDominant =
      allLetters > 0 && arabicCharacters / allLetters >= 0.5;

    const ordered = [...line].sort((a, b) =>
      isArabicDominant ? b.x - a.x : a.x - b.x,
    );

    return ordered
      .map((token) => token.text)
      .join(" ")
      .replace(/\s+([،؛:,.!?؟])/g, "$1")
      .replace(/([(\[])\s+/g, "$1")
      .replace(/\s+([)\]])/g, "$1")
      .trim();
  });

  return cleanText(rendered.join("\n"));
}

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfFile));

  let document;

  try {
    const loadingTask = pdfjs.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
      verbosity: 0,
    });

    document = await loadingTask.promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          ok: false,
          encrypted: /password|encrypted/i.test(message),
          error: message,
        },
        null,
        2,
      ),
      "utf8",
    );

    process.exit(2);
  }

  const pages = [];
  const warnings = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    try {
      const page = await document.getPage(pageNumber);

      const content = await page.getTextContent({
        includeMarkedContent: false,
        disableNormalization: false,
      });

      pages.push(reconstructPage(content.items));
      page.cleanup();
    } catch (error) {
      pages.push("");
      warnings.push(
        `Page ${pageNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (typeof document?.destroy === "function") {
    await document.destroy();
  } else if (typeof document?.cleanup === "function") {
    document.cleanup();
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      {
        ok: true,
        extractor: "pdfjs-dist",
        pageCount: pages.length,
        pages,
        warnings,
      },
      null,
      2,
    ),
    "utf8",
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack : String(error);

  try {
    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          ok: false,
          encrypted: false,
          error: message,
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch {
    // Ignore secondary output errors.
  }

  console.error(message);
  process.exit(1);
});
