// app/components/Navbar.tsx
'use client';
import { usePathname } from 'next/navigation';
import PillNav, { PillNavItem } from './PillNav';

const items: PillNavItem[] = [
  { label: 'Home',                      href: '/' },
  { label: 'Gallery',                   href: '/gallery' },
  { label: 'Generate from text',        href:'/generatefromtext'},
  { label: 'Generate from image',       href: '/generatefromimage' },
  { label: 'viewer',                    href: '/viewer'},
];

export default function Navbar() {
  const pathname = usePathname() || '/';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000]">
      <PillNav
        items={items}
        activeHref={pathname}                  
        className="rounded-full bg-transparent backdrop-blur-sm"
        ease="power2.easeOut"
        baseColor="transparent"              
        pillColor="#0e1426"
        pillTextColor="#e6eefc"
        hoveredPillTextColor="#ffffff"
      />
    </div>
  );
}
