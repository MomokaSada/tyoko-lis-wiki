'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CheckCircle2 } from 'lucide-react';

export function DeleteNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('deleted') === '1') {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('deleted');
    const newQs = params.toString();
    router.replace(newQs ? `?${newQs}` : window.location.pathname);
  };

  if (!mounted) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="削除完了"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-black text-stone-900 mb-2">項目を削除しました</h4>
        <p className="text-sm text-stone-500 font-medium mb-8">
          対象の項目は完全に削除されました。
        </p>
        <button
          onClick={handleClose}
          className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-stone-900/10 active:scale-[0.98]"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
