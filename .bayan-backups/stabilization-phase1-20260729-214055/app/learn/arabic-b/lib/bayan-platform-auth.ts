import "server-only";

import { requireAdmin } from "@/src/lib/admin-auth";

/**
 * Compatibility authentication helper for BAYAN Platform API routes.
 * Extra arguments are accepted so older routes may pass NextRequest.
 */
export async function authorizeBayanAdmin(..._args: unknown[]) {
  return requireAdmin();
}
