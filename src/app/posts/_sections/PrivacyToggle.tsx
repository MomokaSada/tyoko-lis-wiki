'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

interface PrivacyToggleProps {
  initialShowPrivate: boolean;
}

export function PrivacyToggle({ initialShowPrivate }: PrivacyToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    const nextValue = !initialShowPrivate;
    
    if (nextValue) {
      params.set('showPrivate', '1');
    } else {
      params.delete('showPrivate');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-500 shadow-2xl backdrop-blur-xl ${
        initialShowPrivate 
          ? 'bg-amber-500 border-amber-400 text-stone-900 rotate-[360deg]' 
          : 'bg-white/5 border-white/10 text-stone-500 hover:bg-white/10 hover:text-white hover:border-white/20'
      } ${isPending ? 'opacity-50' : 'opacity-100'}`}
      title={initialShowPrivate ? '公開中のみ表示' : '非公開も含めて表示'}
    >
      <div className="relative">
        {initialShowPrivate ? (
          <Eye size={20} className="animate-in zoom-in duration-300" />
        ) : (
          <EyeOff size={20} className="animate-in zoom-in duration-300" />
        )}
      </div>
      
      <span className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none">
        {initialShowPrivate ? 'Private Mode: ON' : 'Private Mode: OFF'}
      </span>
    </button>
  );
}
