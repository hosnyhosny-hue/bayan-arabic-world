import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker, OEM, PSM } from "tesseract.js";

const [, , pdfFile, outputFile] = process.argv;

if (!pdfFile || !outputFile) {
  console.error(
    "Usage: node ocr-worker.mjs <pdf-file> <output-json>",
  );
  process.exit(1);
}

const scale = Math.max(
  1.5,
  Math.min(3, Number(process.env.BAYAN_OCR_SCALE ?? 2)),
);

const languages = String(
  process.env.BAYAN_OCR_LANGUAGES ?? "ara+eng",
)
  .split("+")
  .map((value) => value.trim())
  .filter(Boolean);

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

function writeResult(value) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(
    outputFile,
    JSON.stringify(value, null, 2) + "\n",
    "utf8",
  );
}

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfFile));

  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
    verbosity: 0,
  });

  const document = await loadingTask.promise;

  console.error(
    `[BAYAN OCR] Initializing languages: ${languages.join("+")}`,
  );

  const worker = await createWorker(
    languages,
    OEM.LSTM_ONLY,
    {
      logger(message) {
        if (
          message?.status === "recognizing text" &&
          Number.isFinite(message.progress)
        ) {
          const percentage = Math.round(message.progress * 100);
          process.stderr.write(
            `\r[BAYAN OCR] Recognition ${percentage}%   `,
          );
        }
      },
    },
  );

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: "1",
    user_defined_dpi: "300",
  });

  const pages = [];
  const pageDiagnostics = [];
  const warnings = [];

  try {
    for (
      let pageNumber = 1;
      pageNumber <= document.numPages;
      pageNumber += 1
    ) {
      console.error(
        `\n[BAYAN OCR] Page ${pageNumber}/${document.numPages}`,
      );

      try {
        const page = await document.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const width = Math.ceil(viewport.width);
        const height = Math.ceil(viewport.height);

        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const png = canvas.toBuffer("image/png");

        const recognition = await worker.recognize(png);
        const text = cleanText(recognition?.data?.text ?? "");
        const confidence = Number(
          recognition?.data?.confidence ?? 0,
        );

        pages.push(text);

        pageDiagnostics.push({
          page: pageNumber,
          characters: [...text].length,
          words: text ? text.split(/\s+/).filter(Boolean).length : 0,
          confidence: Number(confidence.toFixed(2)),
          width,
          height,
          scale,
        });

        page.cleanup?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);

        pages.push("");
        pageDiagnostics.push({
          page: pageNumber,
          characters: 0,
          words: 0,
          confidence: 0,
          error: message,
        });

        warnings.push(`Page ${pageNumber}: ${message}`);
      }

      /*
       * Save a checkpoint after every page. This provides useful diagnostics
       * if a long OCR job is interrupted.
       */
      writeResult({
        ok: true,
        complete: false,
        extractor: "tesseract.js-ocr",
        languages,
        scale,
        pageCount: document.numPages,
        processedPages: pages.length,
        pages,
        pageDiagnostics,
        warnings,
      });
    }
  } finally {
    process.stderr.write("\n");

    await worker.terminate();

    if (typeof document?.destroy === "function") {
      await document.destroy();
    } else if (typeof document?.cleanup === "function") {
      document.cleanup();
    }
  }

  writeResult({
    ok: true,
    complete: true,
    extractor: "tesseract.js-ocr",
    languages,
    scale,
    pageCount: pages.length,
    processedPages: pages.length,
    pages,
    pageDiagnostics,
    warnings,
  });

  console.error("[BAYAN OCR] Complete");
}

main().catch((error) => {
  const message =
    error instanceof Error ? error.stack ?? error.message : String(error);

  try {
    writeResult({
      ok: false,
      complete: false,
      extractor: "tesseract.js-ocr",
      languages,
      scale,
      error: message,
    });
  } catch {
    // Ignore secondary write failures.
  }

  console.error(message);
  process.exit(1);
});
