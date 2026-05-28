'use client';

import { useActionState, useState } from 'react';
import {
  deleteContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const initialState: ContentActionState = {
  error: null,
  slug: null,
  title: null,
};

interface DeletePostFormProps {
  contentId: number;
  compact?: boolean;
}

export function DeletePostForm({ contentId, compact = false }: DeletePostFormProps) {
  const [state, action, isPending] = useActionState(deleteContentAction, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 flex items-center gap-2 group"
          title="項目を削除"
        >
          <Trash2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="sr-only">削除</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          項目を削除する
        </button>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="項目の削除"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6">
          <p className="text-sm text-stone-600 leading-relaxed">
            この項目を完全に削除します。
            <br />
            この操作は<strong className="text-red-600">取り消せません</strong>。本当によろしいですか？
          </p>

          <form action={action} className="space-y-3">
            <input type="hidden" name="contentId" value={contentId} />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    削除中...
                  </>
                ) : (
                  '削除する'
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-5 py-2.5 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors text-sm"
                disabled={isPending}
              >
                キャンセル
              </button>
            </div>

            {state.error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {state.error}
              </p>
            )}
          </form>
        </div>
      </Modal>
    </>
  );
}
