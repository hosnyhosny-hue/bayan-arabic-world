import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cleanPageText } from "./lib.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workerFile = path.join(currentDirectory, "ocr-worker.mjs");

export function extractPdfWithOcr(file, expectedPages) {
  const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "bayan-ocr-"),
  );

  const outputFile = path.join(tempDirectory, "ocr-result.json");

  try {
    execFileSync(
      process.execPath,
      [workerFile, file, outputFile],
      {
        stdio: ["ignore", "inherit", "inherit"],
        /*
         * OCR output is written to JSON rather than stdout.
         * No process timeout is imposed because large books can take time.
         */
        env: {
          ...process.env,
          BAYAN_OCR_LANGUAGES:
            process.env.BAYAN_OCR_LANGUAGES ?? "ara+eng",
          BAYAN_OCR_SCALE:
            process.env.BAYAN_OCR_SCALE ?? "2",
        },
      },
    );

    if (!fs.existsSync(outputFile)) {
      throw new Error("OCR worker did not create an output file.");
    }

    const result = JSON.parse(
      fs.readFileSync(outputFile, "utf8"),
    );

    if (!result.ok) {
      throw new Error(result.error || "OCR extraction failed.");
    }

    if (!result.complete) {
      throw new Error(
        `OCR stopped after ${
          result.processedPages ?? 0
        } of ${result.pageCount ?? "unknown"} pages.`,
      );
    }

    let pages = Array.isArray(result.pages)
      ? result.pages.map(cleanPageText)
      : [];

    const expected = Number(expectedPages ?? 0);

    if (
      Number.isFinite(expected) &&
      expected > 0 &&
      pages.length < expected
    ) {
      pages = [
        ...pages,
        ...Array.from(
          { length: expected - pages.length },
          () => "",
        ),
      ];
    }

    return {
      extractor: result.extractor || "tesseract.js-ocr",
      pages,
      warnings: [
        ...(Array.isArray(result.warnings)
          ? result.warnings
          : []),
        `OCR languages: ${(result.languages ?? []).join("+")}`,
        `OCR rendering scale: ${result.scale ?? "unknown"}`,
      ],
      ocr: {
        languages: result.languages ?? [],
        scale: result.scale ?? null,
        pageDiagnostics: result.pageDiagnostics ?? [],
      },
    };
  } catch (error) {
    if (fs.existsSync(outputFile)) {
      try {
        const result = JSON.parse(
          fs.readFileSync(outputFile, "utf8"),
        );

        if (result.error) {
          throw new Error(result.error);
        }
      } catch (resultError) {
        if (resultError instanceof Error) {
          throw resultError;
        }
      }
    }

    throw new Error(
      `BAYAN OCR failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    fs.rmSync(tempDirectory, {
      recursive: true,
      force: true,
    });
  }
}
