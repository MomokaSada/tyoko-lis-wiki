'use client';

import { useActionState, useState } from 'react';
import {
  deleteContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import { Trash2, AlertTriangle } from 'lucide-react';
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
          title="記事を削除"
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
          記事を削除する
        </button>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="記事の削除"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-wider">警告</p>
              <p className="text-sm font-medium leading-relaxed">
                この記事を完全に削除します。この操作は取り消せません。本当によろしいですか？
              </p>
            </div>
          </div>

          <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="contentId" value={contentId} />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    削除中...
                  </>
                ) : (
                  'はい、この記事を削除します'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                disabled={isPending}
              >
                キャンセル
              </button>
            </div>

            {state.error && (
              <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {state.error}
              </p>
            )}
          </form>
        </div>
      </Modal>
    </>
  );
}
