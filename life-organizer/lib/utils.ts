import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, addDays, subDays, addMonths, subMonths, addYears, subYears, isSameDay, isSameMonth, isSameYear, differenceInDays } from 'date-fns';

export const cn = (...args: (string | boolean | undefined | null)[]) => {
  return args.filter(Boolean).join(' ');
};

// 格式化时间显示
export function formatHM(date: string | Date): string {
  return format(typeof date === 'string' ? parseISO(date) : date, 'HH:mm');
}

export function formatYMD(date: string | Date): string {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
}

// 把秒数转为 "X小时Y分"
export function secondsToReadable(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分`;
  return `${m}分`;
}

// 周范围
export function getWeekRange(date: Date): { start: Date; end: Date } {
  return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
}

// 月范围
export function getMonthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

// 年范围
export function getYearRange(date: Date): { start: Date; end: Date } {
  return { start: startOfYear(date), end: endOfYear(date) };
}

// 把"事件数组"按日期（YYYY-MM-DD）分组
export function groupByDate<T extends { start_at?: string; diary_date?: string; recorded_date?: string }>(items: T[]): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const date = (item as any).diary_date || (item as any).recorded_date || (item as any).start_at?.split('T')[0];
    if (!date) continue;
    if (!result[date]) result[date] = [];
    result[date].push(item);
  }
  return result;
}

export {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameDay,
  isSameMonth,
  isSameYear,
  differenceInDays,
};
