import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cleanPageText } from "./lib.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workerFile = path.join(currentDirectory, "pdfjs-worker.mjs");

function extractWithPdfJs(file, expectedPages) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bayan-pdfjs-"));
  const outputFile = path.join(tempDir, "result.json");

  try {
    execFileSync(
      process.execPath,
      [workerFile, file, outputFile],
      {
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 20 * 1024 * 1024,
      },
    );

    if (!fs.existsSync(outputFile)) {
      throw new Error("PDF.js worker did not generate an output file.");
    }

    const result = JSON.parse(fs.readFileSync(outputFile, "utf8"));

    if (!result.ok) {
      if (result.encrypted) {
        throw new Error(`Encrypted PDF: ${result.error}`);
      }

      throw new Error(result.error || "PDF.js extraction failed.");
    }

    let pages = Array.isArray(result.pages)
      ? result.pages.map(cleanPageText)
      : [];

    while (pages.length > 0 && pages.at(-1) === "") {
      pages.pop();
    }

    /*
     * Preserve expected page count when PDF metadata knew about more pages
     * than the parser returned.
     */
    const expected = Number(expectedPages ?? 0);

    if (Number.isFinite(expected) && expected > pages.length) {
      pages = [
        ...pages,
        ...Array.from({ length: expected - pages.length }, () => ""),
      ];
    }

    return {
      extractor: result.extractor || "pdfjs-dist",
      pages,
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
    };
  } catch (error) {
    const stderr = error?.stderr
      ? Buffer.from(error.stderr).toString("utf8").trim()
      : "";

    if (fs.existsSync(outputFile)) {
      try {
        const result = JSON.parse(fs.readFileSync(outputFile, "utf8"));

        if (result.encrypted) {
          throw new Error(`Encrypted PDF: ${result.error}`);
        }

        if (result.error) {
          throw new Error(result.error);
        }
      } catch (outputError) {
        if (
          outputError instanceof Error &&
          outputError.message !== "Unexpected end of JSON input"
        ) {
          throw outputError;
        }
      }
    }

    const message =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `PDF.js extraction failed: ${message}${
        stderr ? `\n${stderr}` : ""
      }`,
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

export function extractPdfText(file, expectedPages) {
  return extractWithPdfJs(file, expectedPages);
}
