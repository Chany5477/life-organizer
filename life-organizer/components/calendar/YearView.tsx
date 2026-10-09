'use client';

import { useMemo, useState } from 'react';
import {
  addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, format,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { EventItem, DateHighlight } from '@/lib/types';

interface Props {
  year: number;
  onMonthClick: (date: Date) => void;
  onEventClick: (date: Date) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function YearView({ year, onMonthClick, onEventClick }: Props) {
  const [highlights, setHighlights] = useState<Record<string, DateHighlight>>({});
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  // 加载整年的高亮和事件数
  useMemo(() => {
    const start = new Date(year, 0, 1).toISOString();
    const end = new Date(year, 11, 31, 23, 59, 59).toISOString();
    Promise.all([
      api.listHighlights(start, end),
      api.listEvents(start, end),
    ]).then(([hl, evs]) => {
      const hMap: Record<string, DateHighlight> = {};
      hl.forEach((h) => {
        hMap[h.highlight_date] = h;
      });
      setHighlights(hMap);

      const countMap: Record<string, number> = {};
      evs.forEach((e) => {
        const key = (e.start_at || '').split('T')[0];
        if (key) countMap[key] = (countMap[key] || 0) + 1;
      });
      setEventCounts(countMap);
    }).catch(() => {});
  }, [year]);

  async function toggleHighlight(date: Date) {
    const key = format(date, 'yyyy-MM-dd');
    if (highlights[key]) {
      try {
        await api.deleteHighlight(key);
        const newHl = { ...highlights };
        delete newHl[key];
        setHighlights(newHl);
      } catch (e: any) {
        toast.error(e.message);
      }
    } else {
      try {
        const created = await api.upsertHighlight({ highlight_date: key, color: '#ef4444', label: '标记' });
        setHighlights({ ...highlights, [key]: created });
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  }

  // 生成 12 个月的网格
  const months = Array.from({ length: 12 }, (_, i) => addMonths(new Date(year, 0, 1), i));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-2">
      {months.map((month) => (
        <div
          key={month.toISOString()}
          className="card p-2 cursor-pointer"
          onClick={() => onMonthClick(month)}
        >
          <div className="font-semibold mb-1 text-sm">
            {format(month, 'M月', { locale: zhCN })}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[10px] text-gray-400 text-center">{d}</div>
            ))}
            {renderMonthDays(month, highlights, eventCounts, onEventClick, toggleHighlight)}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderMonthDays(
  month: Date,
  highlights: Record<string, DateHighlight>,
  eventCounts: Record<string, number>,
  onEventClick: (d: Date) => void,
  toggleHighlight: (d: Date) => void
) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  // 补齐前面的空格
  const firstWeekday = getDay(start); // 0-6
  const blanks = Array.from({ length: firstWeekday }, (_, i) => (
    <div key={`b-${i}`} className="aspect-square"></div>
  ));

  return blanks.concat(
    days.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const hl = highlights[key];
      const eventCount = eventCounts[key] || 0;
      const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

      return (
        <div
          key={key}
          className="aspect-square relative"
          onClick={(e) => {
            e.stopPropagation();
            if (eventCount > 0) onEventClick(d);
            else toggleHighlight(d);
          }}
        >
          <div
            className={`text-[10px] text-center leading-5 rounded ${
              isToday ? 'bg-brand-500 text-white' : ''
            } ${hl ? 'ring-1 ring-red-500' : ''}`}
            style={hl ? { background: hl.color + '33' } : undefined}
          >
            {format(d, 'd')}
          </div>
          {eventCount > 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
              {Array.from({ length: Math.min(eventCount, 3) }, (_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-brand-500"></div>
              ))}
            </div>
          )}
        </div>
      );
    })
  );
}
