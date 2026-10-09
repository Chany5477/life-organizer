'use client';

import { useEffect, useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import TopBar from '@/components/TopBar';
import Timer from '@/components/timer/Timer';
import TimeBarChart from '@/components/charts/TimeBarChart';
import PieChart from '@/components/charts/PieChart';
import HeatMap from '@/components/charts/HeatMap';
import WeightLineChart from '@/components/charts/WeightLineChart';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Scale, Tag as TagIcon, Plus, BarChart3, Clock } from 'lucide-react';
import type { TimeEntry, Tag, Weight, WeightGoal } from '@/lib/types';

type Range = 'week' | 'month' | 'year';

export default function ReviewPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [range, setRange] = useState<Range>('week');
  const [tab, setTab] = useState<'time' | 'weight'>('time');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  async function refreshAll() {
    try {
      const [t, allEntries] = await Promise.all([api.listTags(), api.listTimeEntries()]);
      setTags(t);
      setEntries(allEntries);
    } catch {}
    try {
      const w = await api.getWeights();
      setWeights(w.weights);
      setGoal(w.goal);
    } catch {}
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const now = new Date();
  const ranges: Record<Range, { start: Date; end: Date; granularity: 'day' | 'week' | 'month' }> = {
    week: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }), granularity: 'day' },
    month: { start: startOfMonth(now), end: endOfMonth(now), granularity: 'day' },
    year: { start: startOfYear(now), end: endOfYear(now), granularity: 'month' },
  };
  const cur = ranges[range];

  const inRange = entries.filter((e) => {
    const d = new Date(e.started_at);
    return d >= cur.start && d <= cur.end;
  });

  const totalSeconds = inRange.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // 按日期分组（用于热力图）
  const dayMap: Record<string, number> = {};
  for (const e of entries) {
    const key = (e.started_at || '').split('T')[0];
    if (e.duration_seconds) dayMap[key] = (dayMap[key] || 0) + e.duration_seconds / 60;
  }

  const days = eachDayOfInterval({ start: cur.start, end: cur.end });

  return (
    <>
      <TopBar title="总结" />
      <main className="max-w-screen-md mx-auto p-3 pb-24 space-y-3">
        <Timer tags={tags} onRecorded={refreshAll} />

        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
          {[
            { v: 'time', label: '时间', icon: Clock },
            { v: 'weight', label: '体重', icon: Scale },
          ].map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setTab(v as 'time' | 'weight')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm transition-colors ${
                tab === v ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === 'time' && (
          <>
            <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
              {(['week', 'month', 'year'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`flex-1 py-1.5 rounded-md text-sm transition-colors ${
                    range === r ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-gray-500'
                  }`}
                >
                  {r === 'week' ? '本周' : r === 'month' ? '本月' : '今年'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard label="总时长" value={`${totalHours}小时`} />
              <StatCard label="条目数" value={String(inRange.length)} />
              <StatCard label="日均" value={`${(totalSeconds / 86400 / Math.max(days.length, 1) * 24).toFixed(1)}h`} />
            </div>

            <div className="card p-3">
              <h3 className="text-sm font-semibold mb-2">
                {range === 'year' ? '月度分布' : '每日分布'}
              </h3>
              <div className="h-56">
                <TimeBarChart entries={inRange} tags={tags} granularity={cur.granularity} days={days} />
              </div>
            </div>

            <div className="card p-3">
              <h3 className="text-sm font-semibold mb-2">各类占比</h3>
              <PieChart entries={inRange} tags={tags} />
            </div>

            {range === 'year' && (
              <div className="card p-3">
                <h3 className="text-sm font-semibold mb-2">年度热力图</h3>
                <HeatMap data={dayMap} startDate={cur.start} endDate={cur.end} />
              </div>
            )}

            <div className="card p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">最近记录</h3>
                <span className="text-xs text-gray-400">{entries.length} 条</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {entries.slice(0, 20).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full" style={{ background: e.tag?.color || '#9ca3af' }}></div>
                      <span className="truncate">{e.tag?.name || '未分类'}</span>
                      {e.note && <span className="text-xs text-gray-400 truncate">· {e.note}</span>}
                    </div>
                    <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {format(new Date(e.started_at), 'M/d HH:mm')}
                      {e.duration_seconds && ` · ${Math.round(e.duration_seconds / 60)}分`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'weight' && (
          <>
            <div className="flex justify-between items-center">
              <Button onClick={() => setWeightModalOpen(true)}>
                <Plus size={16} />记录体重
              </Button>
              <Button variant="secondary" onClick={() => setGoalModalOpen(true)}>
                <BarChart3 size={16} />设置目标
              </Button>
            </div>
            <div className="card p-3">
              <div className="h-64">
                <WeightLineChart weights={weights} goal={goal} />
              </div>
            </div>
            {goal && (
              <div className="card p-3 text-sm">
                <div>当前最近：<strong>{weights.length ? `${weights[weights.length - 1].weight_kg} kg` : '-'}</strong></div>
                <div>目标：<strong>{goal.target_kg} kg</strong></div>
                {weights.length && goal && (
                  <div className="text-gray-500 text-xs mt-1">
                    还差 {(Number(weights[weights.length - 1].weight_kg) - goal.target_kg).toFixed(2)} kg
                  </div>
                )}
              </div>
            )}
            <div className="card p-3">
              <h3 className="text-sm font-semibold mb-2">历史记录</h3>
              {weights.length === 0 ? (
                <div className="text-sm text-gray-400 py-4 text-center">还没有体重记录</div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {[...weights].reverse().slice(0, 30).map((w) => (
                    <div key={w.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-500">{w.recorded_date}</span>
                      <span className="font-medium">{w.weight_kg} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Modal open={weightModalOpen} onClose={() => setWeightModalOpen(false)} title="记录体重">
        <WeightForm onSaved={() => { setWeightModalOpen(false); refreshAll(); }} />
      </Modal>

      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="设置目标">
        <GoalForm goal={goal} onSaved={() => { setGoalModalOpen(false); refreshAll(); }} />
      </Modal>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}

function WeightForm({ onSaved }: { onSaved: () => void }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [kg, setKg] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!kg) {
      toast.error('请输入体重');
      return;
    }
    setSaving(true);
    try {
      await api.upsertWeight({ recorded_date: date, weight_kg: parseFloat(kg), note: note || null });
      toast.success('已保存');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input label="日期" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="体重 (kg)" type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="例如 65.5" autoFocus />
      <Input label="备注" value={note} onChange={(e) => setNote(e.target.value)} placeholder="可选" />
      <Button fullWidth onClick={save} disabled={saving}>保存</Button>
    </div>
  );
}

function GoalForm({ goal, onSaved }: { goal: WeightGoal | null; onSaved: () => void }) {
  const [target, setTarget] = useState(goal?.target_kg?.toString() || '');
  const [start, setStart] = useState(goal?.start_kg?.toString() || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!target) {
      toast.error('请输入目标体重');
      return;
    }
    setSaving(true);
    try {
      await api.upsertWeight({ _type: 'goal', target_kg: parseFloat(target), start_kg: start ? parseFloat(start) : null });
      toast.success('已保存');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input label="目标体重 (kg)" type="number" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} autoFocus />
      <Input label="起始体重 (kg)" type="number" step="0.1" value={start} onChange={(e) => setStart(e.target.value)} placeholder="可选" />
      <Button fullWidth onClick={save} disabled={saving}>保存</Button>
    </div>
  );
}
