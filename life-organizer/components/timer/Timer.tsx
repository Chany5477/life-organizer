'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Tag } from '@/lib/types';

interface Props {
  tags: Tag[];
  onRecorded: () => void;
}

export default function Timer({ tags, onRecorded }: Props) {
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [note, setNote] = useState('');
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  function start() {
    if (!selectedTagId) {
      toast.error('请先选择标签');
      return;
    }
    const now = new Date();
    setStartedAt(now);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now.getTime()) / 1000));
    }, 1000);
  }

  async function stop() {
    if (!startedAt) return;
    clearInterval(intervalRef.current);
    const endedAt = new Date();
    const seconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    if (seconds < 5) {
      toast.error('太短了，至少5秒');
      reset();
      return;
    }
    try {
      await api.createTimeEntry({
        tag_id: selectedTagId,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: seconds,
        note: note || null,
      });
      toast.success('已记录');
      onRecorded();
      reset();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStartedAt(null);
    setElapsed(0);
    setNote('');
  }

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  }

  return (
    <div className="card p-4">
      <div className="text-center mb-3">
        <div className="text-4xl font-mono font-bold tabular-nums">
          {formatTime(elapsed)}
        </div>
        {!running && (
          <div className="text-xs text-gray-400 mt-1">选择一个标签开始计时</div>
        )}
      </div>

      {!running && (
        <div className="space-y-2 mb-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTagId(t.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  selectedTagId === t.id
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={selectedTagId === t.id ? { background: t.color } : undefined}
              >
                {t.name}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="备注（可选）"
          />
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {!running ? (
          <button onClick={start} className="btn-primary px-8">
            <Play size={16} />开始
          </button>
        ) : (
          <>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800">
              <RotateCcw size={16} />
            </button>
            <button onClick={stop} className="px-8 py-2 rounded-lg bg-red-500 text-white font-medium">
              <Square size={16} />停止
            </button>
          </>
        )}
      </div>
    </div>
  );
}
