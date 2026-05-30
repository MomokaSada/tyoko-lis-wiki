'use client';

import { useEffect, useRef } from 'react';

/**
 * スクロールロックの参照カウンター。
 * 複数のコンポーネントが同時にロックしても競合しないようにする。
 * iOS Safari でも確実にスクロールを抑制する。
 */
let lockCount = 0;
let scrollYPosition = 0;

export function useScrollLock(isLocked: boolean) {
  const prevRef = useRef(false);

  useEffect(() => {
    if (isLocked && !prevRef.current) {
      lockCount++;
      scrollYPosition = window.scrollY;

      // overflow: hidden だけでは iOS Safari で効かないので position: fixed も併用
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYPosition}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else if (!isLocked && prevRef.current) {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollYPosition);
      }
    }
    prevRef.current = isLocked;

    return () => {
      if (prevRef.current) {
        lockCount--;
        if (lockCount <= 0) {
          lockCount = 0;
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollYPosition);
        }
      }
      prevRef.current = false;
    };
  }, [isLocked]);
}
