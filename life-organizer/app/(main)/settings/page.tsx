'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, Plus, Trash2, Edit3 } from 'lucide-react';
import TopBar from '@/components/TopBar';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Tag } from '@/lib/types';

export default function SettingsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  async function refresh() {
    try {
      setTags(await api.listTags());
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function exportBackup() {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-organizer-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('已下载');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <TopBar title="设置" showBack />
      <main className="max-w-screen-md mx-auto p-3 pb-24 space-y-3">
        <Section title="时间标签">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">用于总结模块的计时分类</span>
            <button
              onClick={() => { setEditingTag(null); setTagModalOpen(true); }}
              className="text-xs text-brand-600"
            >
              <Plus size={12} className="inline mr-1" />新建标签
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tags.map((t) => (
              <div key={t.id} className="card p-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: t.color }}></div>
                <span className="text-sm flex-1 truncate">{t.name}</span>
                <button
                  onClick={() => { setEditingTag(t); setTagModalOpen(true); }}
                  className="text-gray-400 hover:text-brand-600"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`删除标签 "${t.name}"？`)) return;
                    try {
                      await api.deleteTag(t.id);
                      refresh();
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="数据">
          <div className="space-y-2">
            <Button variant="secondary" onClick={exportBackup} fullWidth>
              <Download size={16} />导出全部数据 (JSON)
            </Button>
            <p className="text-xs text-gray-500 px-2">
              导出包含所有事件、日记、SOP、计时、体重等数据。建议每周备份一次。
            </p>
          </div>
        </Section>

        <Section title="关于">
          <div className="card p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">版本</span><span>1.0.0</span></div>
            <div className="flex justify-between"><span className="text-gray-500">技术栈</span><span>Next.js · Supabase · Tesseract.js</span></div>
            <div className="flex justify-between"><span className="text-gray-500">部署</span><span>Vercel</span></div>
          </div>
        </Section>
      </main>

      <TagEditor
        open={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        initial={editingTag}
        onSaved={() => { setTagModalOpen(false); refresh(); }}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function TagEditor({ open, onClose, initial, onSaved }: { open: boolean; onClose: () => void; initial: Tag | null; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setColor(initial?.color || '#8b5cf6');
      setTarget(initial?.target_minutes_per_week?.toString() || '');
    }
  }, [open, initial]);

  async function save() {
    if (!name.trim()) {
      toast.error('请输入标签名');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        color,
        category: 'time' as const,
        target_minutes_per_week: target ? parseInt(target) : null,
      };
      if (initial) {
        await api.updateTag(initial.id, payload);
      } else {
        await api.createTag(payload);
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
    <Modal open={open} onClose={onClose} title={initial ? '编辑标签' : '新建标签'}>
      <div className="space-y-3">
        <Input label="标签名" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：阅读" autoFocus />
        <div>
          <label className="text-xs text-gray-500 block mb-1">颜色</label>
          <div className="flex gap-2 flex-wrap">
            {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#6b7280'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <Input label="周目标（分钟，可选）" type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="例如 300 = 每周 5 小时" />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={save} disabled={saving}>保存</Button>
        </div>
      </div>
    </Modal>
  );
}
