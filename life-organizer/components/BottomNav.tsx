'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, BarChart3, BookOpen, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/plan', label: '计划', icon: Calendar },
  { href: '/review', label: '总结', icon: BarChart3 },
  { href: '/diary', label: '日记', icon: BookOpen },
  { href: '/sop', label: 'SOP', icon: ListChecks },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800 safe-bottom">
      <div className="max-w-screen-md mx-auto grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center py-2 transition-colors',
                active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn('text-xs mt-1', active && 'font-semibold')}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
