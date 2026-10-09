'use client';

import { useEffect, useRef, useState } from 'react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameDay,
} from 'date-fns';
import { Plus, Image as ImageIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { EventItem } from '@/lib/types';

interface Props {
  month: Date;
  onDayClick: (date: Date) => void;
}

interface MonthNote {
  date: string;
  text: string;
  images: string[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function MonthView({ month, onDayClick }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, MonthNote>>({});
  const pressTimer = useRef<any>(null);

  useEffect(() => {
    const start = startOfMonth(month).toISOString();
    const end = endOfMonth(month).toISOString();
    api.listEvents(start, end).then(setEvents).catch(() => {});
    try {
      const all = JSON.parse(localStorage.getItem('month_notes') || '{}');
      setNotesMap(all);
    } catch {}
  }, [month]);

  function eventsOfDay(d: Date) {
    const key = format(d, 'yyyy-MM-dd');
    return events.filter((e) => (e.start_at || '').startsWith(key));
  }

  function startPress(d: Date) {
    pressTimer.current = setTimeout(() => {
      openNoteEditor(d);
    }, 600);
  }
  function endPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  function openNoteEditor(d: Date) {
    const key = format(d, 'yyyy-MM-dd');
    const note = notesMap[key];
    setEditingDate(d);
    setNoteText(note?.text || '');
    setNoteImages(note?.images || []);
  }

  function saveNote() {
    if (!editingDate) return;
    const key = format(editingDate, 'yyyy-MM-dd');
    const newMap = { ...notesMap };
    if (!noteText.trim() && noteImages.length === 0) {
      delete newMap[key];
    } else {
      newMap[key] = { date: key, text: noteText, images: noteImages };
    }
    setNotesMap(newMap);
    localStorage.setItem('month_notes', JSON.stringify(newMap));
    toast.success('保存成功');
    setEditingDate(null);
    setNoteText('');
    setNoteImages([]);
  }

  function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNoteImages((imgs) => [...imgs, reader.result as string]);
        }
      };
      reader.readAsDataURL(f);
    }
    e.target.value = '';
  }

  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const firstWeekday = getDay(start);
  const blanks = Array.from({ length: firstWeekday }, (_, i) => (
    <div key={`b-${i}`} className="aspect-square"></div>
  ));

  return (
    <>
      <div className="grid grid-cols-7 gap-1 px-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
        ))}
        {blanks}
        {days.map((d) => {
          const dayEvents = eventsOfDay(d);
          const note = notesMap[format(d, 'yyyy-MM-dd')];
          const isToday = isSameDay(d, new Date());
          return (
            <div
              key={d.toISOString()}
              className={`day-cell flex-col items-stretch !p-1 ${isToday ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200' : ''}`}
              onClick={() => onDayClick(d)}
              onTouchStart={() => startPress(d)}
              onTouchEnd={endPress}
              onContextMenu={(e) => {
                e.preventDefault();
                openNoteEditor(d);
              }}
            >
              <div className="text-xs font-medium">{format(d, 'd')}</div>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="h-1 flex-1 rounded"
                    style={{ background: ev.color }}
                  />
                ))}
              </div>
              {note && (note.text || note.images.length > 0) && (
                <div className="absolute top-1 right-1">
                  {note.images.length > 0 ? (
                    <ImageIcon size={10} className="text-gray-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!editingDate} onClose={() => setEditingDate(null)} title={editingDate ? format(editingDate, 'yyyy-MM-dd') + ' 备注' : '备注'}>
        <div className="space-y-3">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="今天有什么想记下来的？"
          />
          <div>
            <label className="text-xs text-gray-500 block mb-1">图片</label>
            <div className="flex flex-wrap gap-2">
              {noteImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setNoteImages(noteImages.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-5"
                  >×</button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer">
                <Plus size={18} className="text-gray-400" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditingDate(null)}>取消</Button>
            <Button onClick={saveNote}>保存</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
