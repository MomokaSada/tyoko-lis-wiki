import React from 'react';
import { TyokoreIcon } from '../icons/TyokoreIcon';

export const Footer = () => {
  return (
    <footer className="border-t border-stone-100 py-16 mt-20 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TyokoreIcon className="w-8 h-8 opacity-70" />
              <h2 className="text-sm font-black uppercase tracking-widest">Tyokore Wiki</h2>
            </div>
            <p className="text-xs text-stone-400 font-medium max-w-xs leading-relaxed">
              ちょこれWikiはファンによって運営されている非公式コミュニティサイトです。コンテンツの無断転載を禁じます。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Links</h4>
              <ul className="space-y-2 text-xs font-bold text-stone-600">
                <li className="hover:text-stone-900 cursor-pointer">Twitter</li>
                <li className="hover:text-stone-900 cursor-pointer">Mirrativ</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-xs font-bold text-stone-600">
                <li className="hover:text-stone-900 cursor-pointer">利用規約</li>
                <li className="hover:text-stone-900 cursor-pointer">プライバシー</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-stone-100 flex justify-between items-center">
          <p className="text-[10px] text-stone-400 font-black tracking-widest uppercase">© 2024 Tyokore Wiki Project</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Server Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
