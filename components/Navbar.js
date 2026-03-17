import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/vocabulary', label: 'Từ vựng', icon: '📚' },
  { href: '/quiz', label: 'Quiz', icon: '✏️' },
  { href: '/listening', label: 'Nghe', icon: '🎧' },
  { href: '/speaking', label: 'Nói', icon: '🎤' },
  { href: '/writing', label: 'Viết', icon: '🖊️' },
  { href: '/progress', label: 'Tiến độ', icon: '📊' },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top navbar */}
      <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-700">
              <span className="text-2xl hanzi">汉</span>
              <span className="text-base md:text-lg">HSK Tiếng Trung</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${router.pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(!open)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200">
              {open ? (
                <span className="text-xl">✕</span>
              ) : (
                <div className="space-y-1.5">
                  <span className="block w-5 h-0.5 bg-current"></span>
                  <span className="block w-5 h-0.5 bg-current"></span>
                  <span className="block w-5 h-0.5 bg-current"></span>
                </div>
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {open && (
            <div className="md:hidden pb-2 border-t border-gray-100">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 text-base font-medium transition-colors
                    ${router.pathname === item.href
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                  {router.pathname === item.href && <span className="ml-auto text-blue-400">●</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-7 h-14">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors
                ${router.pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] font-medium leading-none truncate w-full text-center px-0.5">
                {item.label === 'Trang chủ' ? 'Home' : item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-16 fixed-bottom-spacer pointer-events-none" />
    </>
  );
}