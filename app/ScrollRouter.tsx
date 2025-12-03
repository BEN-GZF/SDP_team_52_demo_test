'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const BASE = '/SDP_team_52_demo_test';  
const ORDER = [
  '/', 
  '/gallery', 
  '/generatefromtext', 
  '/generatefromimage',
  '/viewer'
];
const EXIT_MS = 320;

const normalizePath = (path: string) => {
  if (!path) return '/';
  if (path.startsWith(BASE)) {
    const stripped = path.slice(BASE.length) || '/';
    return stripped.startsWith('/') ? stripped : '/' + stripped;
  }
  return path;
};

export default function ScrollRouter() {
  const rawPathname = usePathname() || '/';
  const pathname = normalizePath(rawPathname);   
  const router = useRouter();
  const lock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const animateAndPush = (nextPath: string) => {
    if (lock.current) return;
    lock.current = true;

    const pageEl = document.getElementById('page');
    if (pageEl) {
      pageEl.classList.remove('page-enter');
      pageEl.classList.add('page-exit');
    }

    window.setTimeout(() => {
      // 这里仍然用不带 base 的 path，Next 会自动加 basePath
      router.push(nextPath);

      window.setTimeout(() => {
        lock.current = false;
      }, 80);
    }, EXIT_MS);
  };

  const go = (dir: 'up' | 'down') => {
    if (lock.current) return;

    const idx = ORDER.indexOf(pathname);  // 用处理过的 pathname
    if (idx === -1) {
      // 如果没匹配上，就别乱跳，直接返回
      return;
    }

    let next = idx;
    if (dir === 'down' && idx < ORDER.length - 1) next = idx + 1;
    if (dir === 'up' && idx > 0) next = idx - 1;
    if (next === idx) return;
    animateAndPush(ORDER[next]);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30) return;
      e.deltaY > 0 ? go('down') : go('up');
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'PageDown' || e.key === 'ArrowDown') go('down');
      if (e.key === 'PageUp' || e.key === 'ArrowUp') go('up');
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const dy = endY - touchStartY.current;
      if (dy < -50) go('down');
      if (dy > 50) go('up');
      touchStartY.current = null;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname]);

  return null;
}
