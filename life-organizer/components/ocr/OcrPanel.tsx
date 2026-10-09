'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Camera, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Props {
  onTextExtracted: (text: string) => void;
  language?: string;
}

export default function OcrPanel({ onTextExtracted, language = 'chi_sim+eng' }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function recognize(file: File) {
    setLoading(true);
    setProgress(0);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      // 动态导入 tesseract.js（首次加载较慢，但不阻塞首屏）
      const Tesseract = (await import('tesseract.js')).default;

      const result = await Tesseract.recognize(file, language, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text.trim();
      if (!text) {
        toast.error('没有识别出文字，请检查图片是否清晰');
        return;
      }
      onTextExtracted(text);
      toast.success(`识别完成（${text.length}字）`);
    } catch (e: any) {
      console.error(e);
      toast.error('识别失败：' + (e.message || '未知错误'));
    } finally {
      setLoading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) recognize(f);
    e.target.value = '';
  }

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Camera size={16} />截图识别（OCR）
      </h3>
      <p className="text-xs text-gray-500">
        上传或拍照 ChatGPT 截图，自动提取文字。中英文都支持。
      </p>

      {preview && (
        <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img src={preview} alt="预览" className="w-full max-h-64 object-contain" />
        </div>
      )}

      {loading && (
        <div>
          <div className="flex items-center gap-2 text-sm mb-1">
            <Loader2 size={14} className="animate-spin" />识别中… {progress}%
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">首次使用需下载约 20MB 识别引擎，请耐心等待</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium"
          >
            <Upload size={16} />从相册选
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-sm font-medium"
          >
            <Camera size={16} />拍一张
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
        </div>
      )}
    </div>
  );
}
