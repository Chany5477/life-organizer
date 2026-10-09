'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  right?: React.ReactNode;
}

export default function TopBar({ title, showBack, showSettings = true, right }: Props) {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('theme');
    const isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function logout() {
    if (!confirm('确定要退出登录吗？')) return;
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 safe-top">
      <div className="max-w-screen-md mx-auto flex items-center justify-between px-3 h-12">
        <div className="flex items-center gap-1">
          {showBack && (
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-700 dark:text-gray-300">
              <ChevronLeft size={22} />
            </button>
          )}
          {title && <h1 className="font-semibold text-base">{title}</h1>}
        </div>
        <div className="flex items-center gap-1">
          {right}
          <button onClick={toggleTheme} className="p-2 text-gray-500">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {showSettings && (
            <>
              <button onClick={() => router.push('/settings')} className="p-2 text-gray-500">
                <Settings size={18} />
              </button>
              <button onClick={logout} className="p-2 text-gray-500">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
