'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error('请输入密码');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('登录成功');
        router.push('/plan');
        router.refresh();
      } else {
        toast.error(data.error || '密码错误');
      }
    } catch (e) {
      toast.error('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Life Organizer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            日程 · 日历 · 日记 · SOP
          </p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">登录密码</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="请输入你设置的密码"
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-2"
                tabIndex={-1}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '登录中…' : '进入应用'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          本应用仅供个人使用，所有数据加密存储在云端
        </p>
      </div>
    </div>
  );
}
