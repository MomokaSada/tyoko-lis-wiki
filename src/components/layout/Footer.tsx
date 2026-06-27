import React from 'react';
import Link from 'next/link';
import { socialLinks } from '@/lib/socialLinks';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-stone-100 py-12 md:py-14 mt-16 md:mt-20 bg-stone-50/50">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-14">
          <div className="space-y-6">
            <div className="flex items-center">
              <img
                src="/images/logo.webp"
                alt="ちょこちょこ大百科"
                className="w-auto object-contain drop-shadow-sm"
                style={{ height: "clamp(40px, 6.5vw, 72px)" }}
              />
            </div>
            <p className="text-xs text-stone-400 font-medium max-w-xs leading-relaxed">
              ちょこちょこ大百科はファンによって運営されている公式コミュニティサイトです。コンテンツの無断転載を禁じます。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Follow</p>
              <div className="grid gap-2">
                {socialLinks.map((service) => (
                  <Link
                    key={service.name}
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-2xl bg-white pl-2 pr-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                  >
                    <img src={service.icon} alt="" width={12} height={12} className="shrink-0" />
                    <span>{service.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Links</h4>
              <ul className="space-y-3 text-xs font-bold text-stone-600">
                <li className="hover:text-stone-900 cursor-pointer"><Link href="/guide/markdown">Markdownガイド</Link></li>
                <li className="hover:text-stone-900 cursor-pointer"><Link href="/terms">利用規約</Link></li>
                <li className="hover:text-stone-900 cursor-pointer"><Link href="/privacy">プライバシー</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 md:mt-12 pt-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[10px] text-stone-400 font-black tracking-widest uppercase">© {currentYear} Tyokore Wiki Project</p>

        </div>
      </div>
    </footer>
  );
};
