const MAX_SLUG_LENGTH = 255;

function trimHyphens(value: string) {
  return value.replace(/^-+|-+$/g, '');
}

function shortStableHash(input: string) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

/**
 * URLパラメータから受け取ったスラグをデコードする。
 * 不正なパーセントエンコーディングが含まれていても例外を投げずに元の値を返す。
 */
export function decodeSlugParam(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

export function slugify(input: string) {
  const normalized = input.normalize('NFKC').trim().toLowerCase();
  const containsNonAscii = /[^\x00-\x7f]/.test(normalized);

  let base = trimHyphens(
    normalized
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-'),
  );

  if (!base) {
    base = '';
  }

  if (containsNonAscii) {
    const suffix = shortStableHash(normalized);
    const maxBaseLength = Math.max(1, MAX_SLUG_LENGTH - suffix.length - 1);
    const shortened = trimHyphens(base.slice(0, maxBaseLength));
    const safeBase = shortened || '';
    return `${safeBase}-${suffix}`;
  }

  return base.slice(0, MAX_SLUG_LENGTH);
}
