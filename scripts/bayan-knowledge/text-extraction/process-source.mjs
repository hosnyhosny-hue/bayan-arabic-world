import fs from "node:fs";
import path from "node:path";
import {
  arabicCharacterRatio,
  artifactsRoot,
  characterCount,
  cleanPageText,
  loadConfig,
  loadQueue,
  loadSources,
  loadTextManifest,
  normalizeArabic,
  now,
  paragraphCount,
  resolveSourceFile,
  saveQueue,
  saveSources,
  saveTextManifest,
  sha256File,
  slugSafe,
  wordCount,
  writeJson,
} from "./lib.mjs";
import { extractPdfText } from "./pdf-extractor.mjs";
import { extractPdfWithOcr } from "./ocr-extractor.mjs";

function updateQueueJob(queue, sourceId, patch) {
  const job = queue.jobs.find((item) => item.sourceId === sourceId);
  if (!job) return;
  Object.assign(job, patch, { updatedAt: now() });
  job.history ??= [];
  if (patch.status) {
    job.history.push({
      at: job.updatedAt,
      from: job.status,
      to: patch.status,
      reason: patch.reason ?? "Text extraction update",
    });
  }
}

export function processSource(sourceId = null) {
  const config = loadConfig();
  const sources = loadSources();
  const queue = loadQueue();
  const textManifest = loadTextManifest();

  const candidates = (sources.sources ?? []).filter((source) => {
    if (source.mediaType !== "application/pdf") return false;
    if (sourceId) return source.id === sourceId;
    const existing = textManifest.items.find(
      (item) => item.sourceId === source.id,
    );
    return !existing || ["failed", "ocr-required"].includes(existing.status);
  });

  const source = candidates[0];
  if (!source) {
    console.log("No PDF source is ready for text extraction.");
    return false;
  }

  const file = resolveSourceFile(source);
  if (!file) {
    throw new Error(`Source file not found for ${source.id}`);
  }

  const checksum = sha256File(file);
  if (source.checksumSha256 && checksum !== source.checksumSha256) {
    throw new Error(`Checksum mismatch for ${source.id}`);
  }

  const existingQueueJob = queue.jobs.find(
    (item) => item.sourceId === source.id,
  );

  const sourceDir = path.join(artifactsRoot, slugSafe(source.id));
  const pagesDir = path.join(sourceDir, "pages");
  fs.rmSync(sourceDir, { recursive: true, force: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  source.lifecycle = "text-extracting";
  source.updatedAt = now();

  if (existingQueueJob) {
    existingQueueJob.textExtractionStatus = "extracting";
    existingQueueJob.updatedAt = now();
  }

  saveSources(sources);
  saveQueue(queue);

  try {
    const expectedPages =
      existingQueueJob?.metadata?.estimatedPageCount ??
      source.pageCount ??
      null;

    let result = extractPdfText(file, expectedPages);
    let pages = result.pages.map(cleanPageText);

    /*
     * Native PDF extraction always runs first.
     * OCR is activated only when the native result would be classified
     * as ocr-required according to the existing BAYAN thresholds.
     */
    const minimumCharactersPerPage = Number(
      config.minimumCharactersPerPage ?? 40,
    );

    const minimumTextCoverageRatio = Number(
      config.minimumTextCoverageRatio ?? 0.35,
    );

    const nativeMeaningfulPages = pages.filter(
      (text) => characterCount(text) >= minimumCharactersPerPage,
    ).length;

    const nativeCoverageRatio =
      pages.length > 0
        ? nativeMeaningfulPages / pages.length
        : 0;

    const nativeCharacterTotal = pages.reduce(
      (total, text) => total + characterCount(text),
      0,
    );

    const requiresOcr =
      nativeCharacterTotal === 0 ||
      nativeCoverageRatio < minimumTextCoverageRatio;

    if (requiresOcr) {
      console.log(
        `  Native text coverage ${(nativeCoverageRatio * 100).toFixed(1)}%; starting OCR...`,
      );

      const nativeWarnings = Array.isArray(result.warnings)
        ? result.warnings
        : [];

      const ocrResult = extractPdfWithOcr(
        file,
        expectedPages ?? pages.length,
      );

      result = {
        ...ocrResult,
        warnings: [
          ...nativeWarnings,
          "Native PDF text extraction was insufficient; OCR fallback was used.",
          ...(ocrResult.warnings ?? []),
        ],
      };

      pages = result.pages.map(cleanPageText);
    }

    const pageMap = [];
    let rawOffset = 0;
    let totalCharacters = 0;
    let totalWords = 0;
    let totalParagraphs = 0;
    let textPages = 0;

    pages.forEach((text, index) => {
      const pageNumber = index + 1;
      const fileName = `page-${String(pageNumber).padStart(3, "0")}.txt`;
      fs.writeFileSync(
        path.join(pagesDir, fileName),
        text ? text + "\n" : "",
        "utf8",
      );

      const characters = characterCount(text);
      const words = wordCount(text);
      const paragraphs = paragraphCount(text);
      const hasMeaningfulText =
        characters >= Number(config.minimumCharactersPerPage ?? 40);

      if (hasMeaningfulText) textPages += 1;

      pageMap.push({
        page: pageNumber,
        file: `pages/${fileName}`,
        rawOffsetStart: rawOffset,
        rawOffsetEnd: rawOffset + characters,
        characters,
        words,
        paragraphs,
        hasMeaningfulText,
      });

      rawOffset += characters + 2;
      totalCharacters += characters;
      totalWords += words;
      totalParagraphs += paragraphs;
    });

    const rawText = pages.join("\n\n");
    const normalizedText = normalizeArabic(rawText, config);
    const pageCount = pages.length;
    const coverageRatio = pageCount > 0 ? textPages / pageCount : 0;

    let documentType = "text";
    let status = "extracted";

    if (
      totalCharacters === 0 ||
      coverageRatio < Number(config.minimumTextCoverageRatio ?? 0.35)
    ) {
      documentType = totalCharacters === 0 ? "scanned" : "mixed";
      status = "ocr-required";
    } else if (coverageRatio < 0.85) {
      documentType = "mixed";
    }

    const diagnostics = {
      sourceId: source.id,
      generatedAt: now(),
      extractor: result.extractor,
      warnings: result.warnings,
      ocr: result.ocr ?? null,
      documentType,
      status,
      pageCount,
      pagesWithMeaningfulText: textPages,
      textCoverageRatio: Number(coverageRatio.toFixed(4)),
      totalCharacters,
      totalWords,
      totalParagraphs,
      averageCharactersPerPage:
        pageCount > 0 ? Math.round(totalCharacters / pageCount) : 0,
      averageWordsPerPage:
        pageCount > 0 ? Math.round(totalWords / pageCount) : 0,
      arabicCharacterRatio: Number(arabicCharacterRatio(rawText).toFixed(4)),
    };

    fs.writeFileSync(path.join(sourceDir, "raw.txt"), rawText, "utf8");
    fs.writeFileSync(
      path.join(sourceDir, "normalized.txt"),
      normalizedText,
      "utf8",
    );
    writeJson(path.join(sourceDir, "page-map.json"), pageMap);
    writeJson(path.join(sourceDir, "diagnostics.json"), diagnostics);
    writeJson(path.join(sourceDir, "extraction.json"), {
      version: 1,
      sourceId: source.id,
      sourceChecksum: checksum,
      extractedAt: now(),
      extractor: result.extractor,
      status,
      documentType,
      rawTextPath: path.relative(
        process.cwd(),
        path.join(sourceDir, "raw.txt"),
      ),
      normalizedTextPath: path.relative(
        process.cwd(),
        path.join(sourceDir, "normalized.txt"),
      ),
      pageMapPath: path.relative(
        process.cwd(),
        path.join(sourceDir, "page-map.json"),
      ),
      diagnosticsPath: path.relative(
        process.cwd(),
        path.join(sourceDir, "diagnostics.json"),
      ),
    });

    const manifestItem = {
      sourceId: source.id,
      sourceChecksum: checksum,
      status,
      documentType,
      extractor: result.extractor,
      pageCount,
      totalCharacters,
      totalWords,
      textCoverageRatio: diagnostics.textCoverageRatio,
      artifactDirectory: path.relative(process.cwd(), sourceDir),
      updatedAt: now(),
      attempts:
        (textManifest.items.find((item) => item.sourceId === source.id)
          ?.attempts ?? 0) + 1,
      lastError: null,
    };

    const index = textManifest.items.findIndex(
      (item) => item.sourceId === source.id,
    );
    if (index >= 0) textManifest.items[index] = manifestItem;
    else textManifest.items.push(manifestItem);

    source.lifecycle =
      status === "extracted" ? "text-extracted" : "ocr-required";
    source.textExtractionStatus = status;
    source.textArtifactDirectory = manifestItem.artifactDirectory;
    source.updatedAt = now();

    if (existingQueueJob) {
      existingQueueJob.textExtractionStatus = status;
      existingQueueJob.updatedAt = now();
    }

    saveTextManifest(textManifest);
    saveSources(sources);
    saveQueue(queue);

    console.log(`✓ Text extraction complete: ${source.id}`);
    console.log(`  extractor: ${result.extractor}`);
    console.log(`  type: ${documentType}`);
    console.log(`  status: ${status}`);
    console.log(`  pages: ${pageCount}`);
    console.log(`  words: ${totalWords}`);
    console.log(`  coverage: ${(coverageRatio * 100).toFixed(1)}%`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const current = textManifest.items.find(
      (item) => item.sourceId === source.id,
    );
    const failed = {
      sourceId: source.id,
      sourceChecksum: checksum,
      status: "failed",
      documentType: "unknown",
      extractor: null,
      pageCount: 0,
      totalCharacters: 0,
      totalWords: 0,
      textCoverageRatio: 0,
      artifactDirectory: path.relative(process.cwd(), sourceDir),
      updatedAt: now(),
      attempts: (current?.attempts ?? 0) + 1,
      lastError: message,
    };

    const index = textManifest.items.findIndex(
      (item) => item.sourceId === source.id,
    );
    if (index >= 0) textManifest.items[index] = failed;
    else textManifest.items.push(failed);

    source.lifecycle = "text-extraction-failed";
    source.textExtractionStatus = "failed";
    source.updatedAt = now();

    if (existingQueueJob) {
      existingQueueJob.textExtractionStatus = "failed";
      existingQueueJob.updatedAt = now();
    }

    saveTextManifest(textManifest);
    saveSources(sources);
    saveQueue(queue);
    console.error(`✗ Text extraction failed: ${source.id}`);
    console.error(`  ${message}`);
    return false;
  }
}
