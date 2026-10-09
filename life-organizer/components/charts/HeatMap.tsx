'use client';

import { useMemo } from 'react';

interface Props {
  data: Record<string, number>;     // date -> minutes
  startDate: Date;
  endDate: Date;
}

export default function HeatMap({ data, startDate, endDate }: Props) {
  const weeks = useMemo(() => {
    const result: { date: Date; minutes: number }[][] = [];
    let cursor = new Date(startDate);
    while (cursor.getDay() !== 0) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (cursor <= endDate) {
      const week: { date: Date; minutes: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const key = dateKey(cursor);
        week.push({
          date: new Date(cursor),
          minutes: data[key] || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, [data, startDate, endDate]);

  function colorOf(min: number) {
    if (min <= 0) return '#ebedf0';
    if (min < 30) return '#a5d6a7';
    if (min < 60) return '#66bb6a';
    if (min < 120) return '#2e7d32';
    if (min < 240) return '#1b5e20';
    return '#003d00';
  }

  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((d) => (
              <div
                key={d.date.toISOString()}
                className="w-3 h-3 rounded-sm"
                style={{ background: colorOf(d.minutes) }}
                title={`${dateKey(d.date)}: ${Math.round(d.minutes)}分钟`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
        少
        {[0, 30, 60, 120, 240].map((m) => (
          <div key={m} className="w-3 h-3 rounded-sm" style={{ background: colorOf(m + 1) }} />
        ))}
        多
      </div>
    </div>
  );
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
