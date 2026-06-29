export function escapeLikePattern(query: string) {
  return query.replace(/[%_\\]/g, '\\$&');
}