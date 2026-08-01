import type { NextRequest } from "next/server";

const TOKEN_ENV_NAMES = [
  "BAYAN_ADMIN_TOKEN",
  "BAYAN_STUDIO_ADMIN_TOKEN",
  "ADMIN_API_TOKEN",
] as const;

function configuredToken(): string {
  for (const name of TOKEN_ENV_NAMES) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function suppliedToken(request: NextRequest): string {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return (
    request.headers.get("x-bayan-admin-token")?.trim() ??
    request.headers.get("x-admin-token")?.trim() ??
    ""
  );
}

export function authorizeBayanAdmin(request: NextRequest): boolean {
  const expected = configuredToken();

  // Local development remains usable when no admin token is configured.
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  return suppliedToken(request) === expected;
}
