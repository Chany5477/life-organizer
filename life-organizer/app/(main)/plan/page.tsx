'use client';

import { useState } from 'react';
import { format, addYears, subYears, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Calendar as CalendarIcon } from 'lucide-react';
import TopBar from '@/components/TopBar';
import YearView from '@/components/calendar/YearView';
import MonthView from '@/components/calendar/MonthView';
import DayView from '@/components/calendar/DayView';

type ViewMode = 'year' | 'month' | 'day';

export default function PlanPage() {
  const [mode, setMode] = useState<ViewMode>('month');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  function shift(delta: number) {
    if (mode === 'year') setAnchor(delta > 0 ? addYears(anchor, 1) : subYears(anchor, 1));
    else if (mode === 'month') setAnchor(delta > 0 ? addMonths(anchor, 1) : subMonths(anchor, 1));
    else setSelectedDay((d) => new Date(d.getTime() + delta * 24 * 3600000));
  }

  function getTitle() {
    if (mode === 'year') return format(anchor, 'yyyy 年', { locale: zhCN });
    if (mode === 'month') return format(anchor, 'yyyy 年 M 月', { locale: zhCN });
    return format(selectedDay, 'M月d日 EEEE', { locale: zhCN });
  }

  return (
    <>
      <TopBar title="计划" />
      <div className="sticky top-12 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-md mx-auto flex items-center justify-between px-3 py-2">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
            {[
              { v: 'year', icon: CalendarDays, label: '年' },
              { v: 'month', icon: CalendarRange, label: '月' },
              { v: 'day', icon: CalendarIcon, label: '日' },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => {
                  setMode(v as ViewMode);
                  if (v === 'day') setSelectedDay(anchor);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  mode === v ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => shift(-1)} className="p-1.5 text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => { setAnchor(new Date()); setSelectedDay(new Date()); }}
              className="text-sm px-2 py-1 text-gray-500 hover:text-brand-600"
            >今</button>
            <button onClick={() => shift(1)} className="p-1.5 text-gray-500">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="max-w-screen-md mx-auto px-4 pb-2 text-center">
          <h2 className="font-semibold">{getTitle()}</h2>
        </div>
      </div>

      <main className="max-w-screen-md mx-auto pt-2">
        {mode === 'year' && (
          <YearView
            year={anchor.getFullYear()}
            onMonthClick={(d) => { setAnchor(d); setMode('month'); }}
            onEventClick={(d) => { setSelectedDay(d); setMode('day'); }}
          />
        )}
        {mode === 'month' && (
          <MonthView
            month={anchor}
            onDayClick={(d) => { setSelectedDay(d); setMode('day'); }}
          />
        )}
        {mode === 'day' && <DayView date={selectedDay} />}
      </main>
    </>
  );
}
