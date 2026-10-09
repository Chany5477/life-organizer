'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Trash2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { EventItem, Tag, Sop } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  event?: EventItem | null;
  defaultStart?: Date;
  defaultEnd?: Date;
  onSaved: () => void;
}

export default function EventModal({ open, onClose, event, defaultStart, defaultEnd, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [color, setColor] = useState('#7c3aed');
  const [tagId, setTagId] = useState('');
  const [reminder, setReminder] = useState('15');
  const [repeat, setRepeat] = useState('none');
  const [sopId, setSopId] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [sops, setSops] = useState<Sop[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.listTags().then(setTags).catch(() => {});
    api.listSops().then(setSops).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartAt(toInputValue(event.start_at));
      setEndAt(event.end_at ? toInputValue(event.end_at) : '');
      setColor(event.color || '#7c3aed');
      setTagId(event.tag_id || '');
      setReminder(String(event.reminder_minutes ?? 15));
      setRepeat(event.repeat_rule || 'none');
      setSopId(event.sop_id || '');
    } else {
      const start = defaultStart || new Date();
      const end = defaultEnd || new Date(start.getTime() + 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setStartAt(toInputValue(start));
      setEndAt(toInputValue(end));
      setColor('#7c3aed');
      setTagId('');
      setReminder('15');
      setRepeat('none');
      setSopId('');
    }
  }, [event, defaultStart, defaultEnd, open]);

  function toInputValue(d: Date | string) {
    const date = typeof d === 'string' ? new Date(d) : d;
    const tz = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tz).toISOString().slice(0, 16);
  }

  async function save() {
    if (!title.trim()) {
      toast.error('请输入事件标题');
      return;
    }
    setSaving(true);
    const payload: any = {
      title,
      description: description || null,
      start_at: new Date(startAt).toISOString(),
      end_at: endAt ? new Date(endAt).toISOString() : null,
      all_day: !endAt,
      color,
      tag_id: tagId || null,
      reminder_minutes: reminder === 'none' ? null : parseInt(reminder),
      repeat_rule: repeat === 'none' ? null : repeat,
      sop_id: sopId || null,
    };

    try {
      if (event) {
        await api.updateEvent(event.id, payload);
      } else {
        await api.createEvent(payload);
      }

      // 如果关联了 SOP，将 SOP 步骤展开为子事件
      if (sopId && !event) {
        await expandSop(sopId, payload.start_at, payload.end_at);
      }
      toast.success('保存成功');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function expandSop(sopId: string, startISO: string, endISO: string) {
    try {
      const all = await api.listSops();
      const sop = all.find((s) => s.id === sopId);
      if (!sop) return;
      const start = new Date(endISO || startISO);
      let cursor = new Date(start);
      for (const step of sop.steps) {
        const stepStart = new Date(cursor);
        const stepEnd = new Date(cursor.getTime() + step.duration * 60000);
        await api.createEvent({
          title: `  · ${step.title}`,
          description: step.detail || null,
          start_at: stepStart.toISOString(),
          end_at: stepEnd.toISOString(),
          color: sop.color,
          sop_id: sopId,
        });
        cursor = stepEnd;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function remove() {
    if (!event) return;
    if (!confirm('删除该事件以及由 SOP 展开的所有子事件？')) return;
    try {
      await api.deleteEvent(event.id);
      toast.success('已删除');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? '编辑事件' : '新建事件'}>
      <div className="space-y-3">
        <Input label="标题" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给这件事起个名" autoFocus />
        <div className="grid grid-cols-2 gap-2">
          <Input label="开始" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          <Input label="结束" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
        <Textarea label="描述" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="可选" />

        <div>
          <label className="text-xs text-gray-500">颜色</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select label="标签" value={tagId} onChange={(e) => setTagId(e.target.value)}>
            <option value="">不选择</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select label="提醒" value={reminder} onChange={(e) => setReminder(e.target.value)}>
            <option value="none">不提醒</option>
            <option value="0">事件开始时</option>
            <option value="5">提前 5 分钟</option>
            <option value="15">提前 15 分钟</option>
            <option value="30">提前 30 分钟</option>
            <option value="60">提前 1 小时</option>
            <option value="1440">提前 1 天</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select label="重复" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            <option value="none">不重复</option>
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </Select>
          <Select label="关联 SOP" value={sopId} onChange={(e) => setSopId(e.target.value)}>
            <option value="">不关联</option>
            {sops.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2 pt-3">
          {event && (
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} />删除
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={save} disabled={saving}>
            <Save size={16} />{saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
