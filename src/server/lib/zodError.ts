import type { ZodError } from 'zod';

export function getFirstZodErrorMessage(error: ZodError) {
  return error.issues[0]?.message ?? '入力内容を確認してください';
}

/**
 * ZodError からフィールドごとのエラーメッセージを抽出します
 * パスが空の issues は general エラーとして扱います
 */
export function getZodFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    // path が空の場合は general エラーとして扱う
    if (issue.path.length === 0) {
      if (!fieldErrors['_general']) {
        fieldErrors['_general'] = issue.message;
      }
      continue;
    }

    const fieldName = String(issue.path[0]);
    // 最初のエラーのみを保持（後続は上書きしない）
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  return fieldErrors;
}
