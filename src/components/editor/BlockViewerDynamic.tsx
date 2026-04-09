'use client';

import dynamic from 'next/dynamic';

const BlockViewer = dynamic(() => import('./BlockViewer'), { 
  ssr: false, 
  loading: () => (
    <div className="space-y-4 animate-pulse py-4">
      <div className="w-full h-4 bg-stone-100 rounded"></div>
      <div className="w-3/4 h-4 bg-stone-100 rounded"></div>
      <div className="w-5/6 h-4 bg-stone-100 rounded"></div>
    </div>
  )
});

export function BlockViewerDynamic({ markdown }: { markdown: string }) {
  return <BlockViewer markdown={markdown} />;
}
