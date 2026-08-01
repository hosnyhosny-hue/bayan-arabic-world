import fs from "node:fs";
function info(text, key) {
  const m = new RegExp(`/${key}\\s*\\(([^)]*)\\)`, "s").exec(text);
  return m ? m[1].replace(/\\([()\\])/g, "$1").trim() : null;
}
export function extractPdfMetadata(file) {
  const b = fs.readFileSync(file),
    t = b.toString("latin1");
  if (!t.startsWith("%PDF-")) throw new Error("File is not a valid PDF");
  const pages = t.match(/\/Type\s*\/Page\b(?!s)/g);
  const counts = [...t.matchAll(/\/Count\s+(\d+)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n > 0);
  return {
    pdfVersion: t.slice(5, 8),
    fileSizeBytes: b.length,
    estimatedPageCount:
      pages?.length || (counts.length ? Math.max(...counts) : null),
    title: info(t, "Title"),
    author: info(t, "Author"),
    creator: info(t, "Creator"),
    producer: info(t, "Producer"),
    creationDate: info(t, "CreationDate"),
    modificationDate: info(t, "ModDate"),
    encrypted: /\/Encrypt\b/.test(t),
    extractionMethod: "native-pdf-object-scan-v1",
  };
}
