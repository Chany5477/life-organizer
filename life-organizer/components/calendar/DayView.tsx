'use client';

import { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import EventModal from '@/components/calendar/EventModal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { EventItem } from '@/lib/types';

interface Props {
  date: Date;
}

export default function DayView({ date }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStart, setNewStart] = useState<Date | null>(null);
  const [newEnd, setNewEnd] = useState<Date | null>(null);

  useEffect(() => {
    refresh();
  }, [date]);

  async function refresh() {
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const data = await api.listEvents(start.toISOString(), end.toISOString());
      setEvents(data);
    } catch {}
  }

  function createAt(hour: number) {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    setNewStart(start);
    setNewEnd(end);
    setEditingEvent(null);
    setModalOpen(true);
  }

  function createManual() {
    setEditingEvent(null);
    setNewStart(new Date(date.getTime() + 9 * 3600000)); // 默认上午 9 点
    setNewEnd(new Date(date.getTime() + 10 * 3600000));
    setModalOpen(true);
  }

  async function toggleCompleted(ev: EventItem) {
    try {
      await api.updateEvent(ev.id, { completed: !ev.completed });
      toast.success(ev.completed ? '已取消完成' : '已完成');
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // 把事件按开始时间排序
  const sorted = [...events].sort((a, b) => (a.start_at || '').localeCompare(b.start_at));

  // 当前时间指示器
  const isToday = isSameDay(date, new Date());
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = isToday && nowHour >= 0 && nowHour <= 24;

  return (
    <div className="px-3 pb-24">
      <div className="space-y-2">
        {Array.from({ length: 24 }, (_, h) => {
          const hourEvents = sorted.filter((ev) => {
            const s = new Date(ev.start_at);
            return s.getHours() === h;
          });
          return (
            <div key={h} className="flex gap-3 border-t border-gray-100 dark:border-gray-800 pt-2" style={{ minHeight: 56 }}>
              <div className="w-12 text-right">
                <div className="text-xs font-mono text-gray-400">{String(h).padStart(2, '0')}:00</div>
              </div>
              <div className="flex-1 space-y-1">
                {showNowLine && h <= nowHour && h + 1 > nowHour && (
                  <div
                    className="absolute left-12 right-3 h-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{ marginTop: `${(nowHour - h) * 24 - 12}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -mt-[3px] -ml-1"></div>
                  </div>
                )}
                {hourEvents.length === 0 ? (
                  <button
                    onClick={() => createAt(h)}
                    className="w-full h-12 rounded-lg border border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-gray-300 dark:text-gray-700 text-xs flex items-center justify-center"
                  >
                    <Plus size={14} className="mr-1" /> 添加
                  </button>
                ) : (
                  hourEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => { setEditingEvent(ev); setModalOpen(true); }}
                      className="rounded-lg p-2 cursor-pointer"
                      style={{ background: ev.color + '22', borderLeft: `3px solid ${ev.color}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${ev.completed ? 'line-through opacity-60' : ''}`}>{ev.title}</div>
                          {ev.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</div>}
                          <div className="text-xs text-gray-400 mt-0.5">
                            {format(new Date(ev.start_at), 'HH:mm')}
                            {ev.end_at && ` - ${format(new Date(ev.end_at), 'HH:mm')}`}
                            {ev.reminder_minutes != null && <span className="ml-2">🔔 {ev.reminder_minutes === 0 ? '准时' : `${ev.reminder_minutes}分钟前`}</span>}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompleted(ev); }}
                          className={`shrink-0 w-6 h-6 rounded-full border-2 ${ev.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'}`}
                        >
                          {ev.completed && '✓'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={createManual}
        className="fixed bottom-24 right-4 z-30 !w-14 !h-14 !rounded-full !p-0 shadow-lg"
        aria-label="新建事件"
      >
        <Plus size={24} />
      </Button>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editingEvent}
        defaultStart={newStart || undefined}
        defaultEnd={newEnd || undefined}
        onSaved={refresh}
      />
    </div>
  );
}
