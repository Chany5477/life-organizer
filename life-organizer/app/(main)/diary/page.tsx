'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import TopBar from '@/components/TopBar';
import OcrPanel from '@/components/ocr/OcrPanel';
import { Textarea, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Diary } from '@/lib/types';

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [editingDate, setEditingDate] = useState(new Date());
  const [editing, setEditing] = useState<Diary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    try {
      const data = await api.listDiaries();
      setDiaries(data);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function openEditor(d: Date) {
    setEditingDate(d);
    const key = format(d, 'yyyy-MM-dd');
    setEditing(diaries.find((x) => x.diary_date === key) || null);
    setModalOpen(true);
  }

  function openEditorForNew() {
    setEditingDate(new Date());
    setEditing(null);
    setModalOpen(true);
  }

  async function handleSave(content: string, mood: string, images: string[], source: 'manual' | 'ocr') {
    try {
      await api.upsertDiary({
        diary_date: format(editingDate, 'yyyy-MM-dd'),
        content,
        mood,
        image_urls: images,
        source,
      });
      toast.success('已保存');
      setModalOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function removeDiary(id: string) {
    if (!confirm('确认删除该日记？')) return;
    try {
      await api.deleteDiary(id);
      refresh();
      toast.success('已删除');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <TopBar title="日记" />
      <main className="max-w-screen-md mx-auto p-3 pb-24 space-y-3">
        <Button onClick={openEditorForNew} fullWidth>
          <Edit3 size={16} />写今天的日记
        </Button>

        {diaries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm">还没有日记</div>
            <div className="text-xs mt-1">点击上方按钮开始记录</div>
          </div>
        ) : (
          diaries.map((d) => (
            <div key={d.id} className="card p-3">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <div className="font-semibold text-sm">{d.diary_date}</div>
                  {d.mood && (
                    <span className="text-xs text-gray-400">
                      {moodEmoji(d.mood)} {d.mood}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingDate(new Date(d.diary_date));
                      setEditing(d);
                      setModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-brand-600"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => removeDiary(d.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {d.source === 'ocr' && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded mr-1">OCR</span>
              )}
              <p className="text-sm whitespace-pre-wrap line-clamp-3 text-gray-700 dark:text-gray-300">
                {d.content}
              </p>
              {d.image_urls && d.image_urls.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {d.image_urls.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} className="w-12 h-12 rounded object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <DiaryEditor
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        date={editingDate}
        onSave={handleSave}
      />
    </>
  );
}

function moodEmoji(m: string) {
  return { great: '🤩', good: '😊', normal: '😐', bad: '😞' }[m as string] || '';
}

interface EditorProps {
  open: boolean;
  onClose: () => void;
  initial: Diary | null;
  date: Date;
  onSave: (content: string, mood: string, images: string[], source: 'manual' | 'ocr') => Promise<void>;
}

function DiaryEditor({ open, onClose, initial, date, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tab, setTab] = useState<'write' | 'ocr'>('write');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initial?.content || '');
      setMood(initial?.mood || '');
      setImages(initial?.image_urls || []);
      setTab('write');
    }
  }, [open, initial]);

  function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((imgs) => [...imgs, reader.result as string]);
        }
      };
      reader.readAsDataURL(f);
    }
    e.target.value = '';
  }

  function onOcrText(text: string) {
    // 把 OCR 文本追加到现有内容
    const sep = content ? '\n\n' : '';
    setContent(content + sep + text);
    setTab('write');
  }

  async function save() {
    if (!content.trim()) {
      toast.error('日记内容不能为空');
      return;
    }
    setSaving(true);
    try {
      await onSave(content, mood, images, initial?.source || 'manual');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={format(date, 'yyyy年M月d日') + ' 日记'} size="lg">
      <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5 mb-3">
        {[
          { v: 'write', label: '手动写' },
          { v: 'ocr', label: '截图识别' },
        ].map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setTab(v as any)}
            className={`flex-1 py-1.5 rounded-md text-sm transition-colors ${
              tab === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ocr' && <OcrPanel onTextExtracted={onOcrText} />}

      {(tab === 'write' || content) && (
        <>
          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">心情</label>
            <div className="flex gap-2">
              {[
                { v: 'great', emoji: '🤩' },
                { v: 'good', emoji: '😊' },
                { v: 'normal', emoji: '😐' },
                { v: 'bad', emoji: '😞' },
              ].map((m) => (
                <button
                  key={m.v}
                  onClick={() => setMood(mood === m.v ? '' : m.v)}
                  className={`w-10 h-10 rounded-full text-xl transition-all ${
                    mood === m.v ? 'bg-brand-100 dark:bg-brand-900 scale-110' : 'bg-gray-100 dark:bg-zinc-800'
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天过得怎么样？有什么心得？"
            rows={10}
          />

          <div className="mt-3">
            <label className="text-xs text-gray-500 block mb-1">图片</label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="w-16 h-16 rounded-lg object-cover" />
                  <button
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
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
        </>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={save} disabled={saving}>
          <Save size={16} />{saving ? '保存中…' : '保存'}
        </Button>
      </div>
    </Modal>
  );
}
