'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavTabs() {
  const pathname = usePathname();
  const isLectures = pathname?.startsWith('/lecture');

  return (
    <nav className="nav-tabs">
      <Link href="/" className={`nav-tab ${!isLectures ? 'active' : ''}`}>
        Book club
      </Link>
      <Link href="/lectures" className={`nav-tab ${isLectures ? 'active' : ''}`}>
        Lectures
      </Link>
    </nav>
  );
}
