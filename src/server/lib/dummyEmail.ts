export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function buildDummyEmail(username: string) {
  return `${normalizeUsername(username)}@test.com`;
}
