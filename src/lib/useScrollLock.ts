'use client';

import { useEffect, useRef } from 'react';

/**
 * スクロールロックの参照カウンター。
 * 複数のコンポーネントが同時にロックしても競合しないようにする。
 */
let lockCount = 0;

export function useScrollLock(isLocked: boolean) {
  const prevRef = useRef(false);

  useEffect(() => {
    if (isLocked && !prevRef.current) {
      lockCount++;
      document.body.style.overflow = 'hidden';
    } else if (!isLocked && prevRef.current) {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = '';
      }
    }
    prevRef.current = isLocked;

    return () => {
      if (prevRef.current) {
        lockCount--;
        if (lockCount <= 0) {
          lockCount = 0;
          document.body.style.overflow = '';
        }
      }
      prevRef.current = false;
    };
  }, [isLocked]);
}
