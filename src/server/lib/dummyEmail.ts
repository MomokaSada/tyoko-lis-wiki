export function normalizeUsername(userName: string) {
  return userName.trim().toLowerCase();
}

export function buildDummyEmail(userName: string) {
  return `${normalizeUsername(userName)}@test.com`;
}
