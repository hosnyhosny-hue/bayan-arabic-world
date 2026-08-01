export const transitions = {
  registered: ["queued", "archived"],
  queued: ["extracting", "cancelled"],
  extracting: ["needs-review", "failed"],
  "needs-review": ["approved", "rejected", "queued"],
  approved: ["indexed", "queued"],
  indexed: ["queued", "archived"],
  rejected: ["queued", "archived"],
  failed: ["queued", "cancelled"],
  cancelled: ["queued"],
  archived: ["queued"],
};
export function assertTransition(from, to) {
  if (!(transitions[from] ?? []).includes(to))
    throw new Error(`Invalid extraction transition: ${from} -> ${to}`);
}
