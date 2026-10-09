'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Play, Edit3, GripVertical } from 'lucide-react';
import TopBar from '@/components/TopBar';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Sop, SopStep } from '@/lib/types';

export default function SopPage() {
  const [sops, setSops] = useState<Sop[]>([]);
  const [editing, setEditing] = useState<Sop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [executingSop, setExecutingSop] = useState<Sop | null>(null);

  async function refresh() {
    try {
      setSops(await api.listSops());
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  useEffect(() => { refresh(); }, []);

  function create() {
    setEditing({ id: '', title: '', description: '', icon: 'list', color: '#06b6d4', steps: [], total_minutes: 0, category: '', times_executed: 0, last_executed_at: null, created_at: '', updated_at: '' });
    setModalOpen(true);
  }

  async function remove(s: Sop) {
    if (!confirm(`删除 "${s.title}" 模板？`)) return;
    try {
      await api.deleteSop(s.id);
      refresh();
      toast.success('已删除');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <TopBar title="SOP 模板库" />
      <main className="max-w-screen-md mx-auto p-3 pb-24 space-y-3">
        <Button onClick={create} fullWidth>
          <Plus size={16} />新建 SOP
        </Button>
        {sops.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm">还没有 SOP 模板</div>
            <div className="text-xs mt-1">SOP = 标准操作流程，比如 "晨间流程" "睡前流程" 等</div>
          </div>
        ) : (
          sops.map((sop) => (
            <div key={sop.id} className="card p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: sop.color }}>
                      📋
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{sop.title}</div>
                      <div className="text-xs text-gray-500">{sop.steps.length} 步 · 共 {sop.total_minutes} 分钟</div>
                    </div>
                  </div>
                  {sop.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-2">{sop.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditing(sop); setModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-brand-600"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => remove(sop)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mt-2">
                {sop.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs">{i + 1}</div>
                    <span className="flex-1 truncate">{step.title}</span>
                    <span className="text-xs text-gray-400">{step.duration}分</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setExecutingSop(sop)}
                  fullWidth
                >
                  <Play size={14} />执行
                </Button>
              </div>
              {sop.times_executed > 0 && (
                <div className="text-[10px] text-gray-400 mt-1.5">已执行 {sop.times_executed} 次</div>
              )}
            </div>
          ))
        )}
      </main>

      <SopEditor
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSaved={() => { setModalOpen(false); refresh(); }}
      />
      <ExecuteModal
        sop={executingSop}
        onClose={() => setExecutingSop(null)}
        onCompleted={() => { setExecutingSop(null); refresh(); }}
      />
    </>
  );
}

interface EditorProps {
  open: boolean;
  onClose: () => void;
  initial: Sop | null;
  onSaved: () => void;
}

function SopEditor({ open, onClose, initial, onSaved }: EditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [steps, setSteps] = useState<SopStep[]>([]);
  const [saving, setSaving] = useState(false);
  const isNew = initial && !initial.id;

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setDescription(initial?.description || '');
      setColor(initial?.color || '#06b6d4');
      setSteps(initial?.steps || []);
    }
  }, [open, initial]);

  function addStep() {
    setSteps([...steps, { title: '', detail: '', duration: 10, order: steps.length }]);
  }
  function updateStep(idx: number, patch: Partial<SopStep>) {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }
  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })));
  }
  function moveStep(from: number, to: number) {
    if (to < 0 || to >= steps.length) return;
    const ns = [...steps];
    const [item] = ns.splice(from, 1);
    ns.splice(to, 0, item);
    setSteps(ns.map((s, i) => ({ ...s, order: i })));
  }

  const total = steps.reduce((s, x) => s + (Number(x.duration) || 0), 0);

  async function save() {
    if (!title.trim()) {
      toast.error('请输入 SOP 名称');
      return;
    }
    if (steps.length === 0) {
      toast.error('请至少添加一个步骤');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        description: description || null,
        color,
        steps: steps.map((s, i) => ({ ...s, order: i })),
      };
      if (isNew) {
        await api.createSop(payload);
      } else {
        await api.updateSop(initial!.id, payload);
      }
      toast.success('已保存');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isNew ? '新建 SOP' : '编辑 SOP'} size="lg">
      <div className="space-y-3">
        <Input label="名称" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：晨间流程" />
        <Textarea label="描述" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="这个流程的整体目的" />

        <div>
          <label className="text-xs text-gray-500">颜色</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {['#06b6d4', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#a855f7'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-500">步骤（总时长 {total} 分钟）</label>
            <button onClick={addStep} className="text-xs text-brand-600">
              <Plus size={12} className="inline mr-1" />添加步骤
            </button>
          </div>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="card p-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs text-gray-400 w-5">{i + 1}</div>
                  <input
                    value={s.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm"
                    placeholder="步骤名称"
                  />
                  <input
                    type="number"
                    value={s.duration}
                    onChange={(e) => updateStep(i, { duration: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm text-center"
                    placeholder="分"
                  />
                  <button onClick={() => moveStep(i, i - 1)} className="p-1 text-gray-400 text-xs">↑</button>
                  <button onClick={() => moveStep(i, i + 1)} className="p-1 text-gray-400 text-xs">↓</button>
                  <button onClick={() => removeStep(i)} className="p-1 text-red-500"><Trash2 size={12} /></button>
                </div>
                <textarea
                  value={s.detail || ''}
                  onChange={(e) => updateStep(i, { detail: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-xs"
                  placeholder="详细说明（可选）"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={save} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ExecuteModal({ sop, onClose, onCompleted }: { sop: Sop | null; onClose: () => void; onCompleted: () => void }) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sop) {
      setCompleted(new Set());
      setStartTime(null);
    }
  }, [sop]);

  if (!sop) return null;

  function start() {
    setStartTime(new Date());
  }

  async function toggleStep(i: number) {
    const ns = new Set(completed);
    if (ns.has(i)) ns.delete(i);
    else ns.add(i);
    setCompleted(ns);
  }

  async function finish() {
    if (completed.size === 0) {
      toast.error('还没有完成的步骤');
      return;
    }
    const stepCompletions = sop.steps.map((s, i) => ({
      stepIndex: i,
      completed: completed.has(i),
      actualMinutes: s.duration,
    }));
    try {
      // 调用专门 API（这里我们用 sops PATCH 更新 times_executed）
      await api.updateSop(sop.id, { times_executed: sop.times_executed + 1 });
      toast.success('已记录本次执行');
      onCompleted();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const elapsed = startTime ? Math.floor((Date.now() - startTime.getTime()) / 60000) : 0;

  return (
    <Modal open={!!sop} onClose={onClose} title={sop.title} size="lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
          <div>
            <div className="text-xs text-gray-500">预计用时</div>
            <div className="font-mono font-bold">{sop.total_minutes} 分钟</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">实际用时</div>
            <div className="font-mono font-bold">{elapsed} 分钟</div>
          </div>
        </div>

        <div className="space-y-2">
          {sop.steps.map((s, i) => (
            <div
              key={i}
              onClick={() => toggleStep(i)}
              className={`card p-3 cursor-pointer transition-all ${
                completed.has(i) ? 'opacity-60 line-through' : ''
              }`}
              style={completed.has(i) ? { background: sop.color + '15' } : undefined}
            >
              <div className="flex items-start gap-2">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${completed.has(i) ? 'border-transparent' : 'border-gray-300'}`} style={completed.has(i) ? { background: sop.color } : undefined}>
                  {completed.has(i) && <span className="text-white text-xs leading-5 text-center block">✓</span>}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{s.title}</div>
                  {s.detail && <div className="text-xs text-gray-500 mt-0.5">{s.detail}</div>}
                  <div className="text-xs text-gray-400 mt-0.5">预计 {s.duration} 分钟</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          {!startTime ? (
            <Button onClick={start}><Play size={16} />开始执行</Button>
          ) : (
            <Button onClick={finish}>完成</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
