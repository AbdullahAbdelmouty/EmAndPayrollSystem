// Makes user text safe to embed in a LIKE/ILIKE pattern: %, _ and \ lose their special meaning.
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
