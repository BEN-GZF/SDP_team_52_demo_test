'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ORDER = ['/', '/architecture', '/team', '/upload'];

// 退场动画时长（需与 CSS .page-exit 对齐）
const EXIT_MS = 320;

export default function ScrollRouter() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const lock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const animateAndPush = (nextPath: string) => {
    if (lock.current) return;
    lock.current = true;

    // 找到当前页容器并触发退场
    const pageEl = document.getElementById('page');
    if (pageEl) {
      pageEl.classList.remove('page-enter');
      pageEl.classList.add('page-exit');
    }

    // 退场动画完成后再跳转
    window.setTimeout(() => {
      router.push(nextPath);
      // 给一点点时间等待新页面挂载，再解锁
      window.setTimeout(() => { lock.current = false; }, 80);
    }, EXIT_MS);
  };

  const go = (dir: 'up' | 'down') => {
    if (lock.current) return;
    const idx = ORDER.indexOf(pathname);
    let next = idx;
    if (dir === 'down' && idx < ORDER.length - 1) next = idx + 1;
    if (dir === 'up' && idx > 0) next = idx - 1;
    if (next === idx) return;
    animateAndPush(ORDER[next]);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30) return; // 触控板微微滚动忽略
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
      if (dy < -50) go('down'); // 上滑 -> 下页
      if (dy >  50) go('up');   // 下滑 -> 上页
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
