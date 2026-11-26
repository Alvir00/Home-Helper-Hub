/**
 * Clamp untrusted pagination input.
 *
 * Without a ceiling a caller can request every row in a table (`?limit=100000`),
 * which is both a memory risk and a trivial denial-of-service vector.
 */
export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit = 20,
  maxLimit = 100,
): { limit: number; offset: number } {
  const rawLimit = Number.parseInt(String(query.limit ?? ""), 10);
  const rawOffset = Number.parseInt(String(query.offset ?? ""), 10);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), maxLimit)
    : defaultLimit;
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

  return { limit, offset };
}
