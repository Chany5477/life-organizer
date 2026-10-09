// 统一前端 API 客户端

async function req<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) {
      // 未登录，跳转登录
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('未登录');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `请求失败 ${res.status}`);
  }
  return res.json();
}

export const api = {
  // 事件
  listEvents: (start?: string, end?: string) =>
    req<EventItem[]>(`/api/events${start ? `?start=${start}&end=${end}` : ''}`),
  createEvent: (data: any) => req(`/api/events`, { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => req(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => req(`/api/events/${id}`, { method: 'DELETE' }),

  // 标签
  listTags: () => req<Tag[]>(`/api/tags`),
  createTag: (data: any) => req(`/api/tags`, { method: 'POST', body: JSON.stringify(data) }),
  updateTag: (id: string, data: any) => req(`/api/tags/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTag: (id: string) => req(`/api/tags/${id}`, { method: 'DELETE' }),

  // 时间记录
  listTimeEntries: (start?: string, end?: string) =>
    req<TimeEntry[]>(`/api/time-entries${start ? `?start=${start}&end=${end}` : ''}`),
  createTimeEntry: (data: any) => req(`/api/time-entries`, { method: 'POST', body: JSON.stringify(data) }),
  updateTimeEntry: (id: string, data: any) =>
    req(`/api/time-entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTimeEntry: (id: string) => req(`/api/time-entries/${id}`, { method: 'DELETE' }),

  // 体重
  getWeights: () => req<{ weights: Weight[]; goal: WeightGoal | null }>(`/api/weights`),
  upsertWeight: (data: any) => req(`/api/weights`, { method: 'POST', body: JSON.stringify(data) }),

  // 日记
  listDiaries: () => req<Diary[]>(`/api/diaries`),
  getDiary: (date: string) => req<Diary | null>(`/api/diaries?date=${date}`),
  upsertDiary: (data: any) => req(`/api/diaries`, { method: 'POST', body: JSON.stringify(data) }),
  deleteDiary: (id: string) => req(`/api/diaries/${id}`, { method: 'DELETE' }),

  // SOP
  listSops: () => req<Sop[]>(`/api/sops`),
  createSop: (data: any) => req(`/api/sops`, { method: 'POST', body: JSON.stringify(data) }),
  updateSop: (id: string, data: any) => req(`/api/sops/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSop: (id: string) => req(`/api/sops/${id}`, { method: 'DELETE' }),

  // 高亮
  listHighlights: (start?: string, end?: string) =>
    req<DateHighlight[]>(`/api/highlights${start ? `?start=${start}&end=${end}` : ''}`),
  upsertHighlight: (data: any) => req(`/api/highlights`, { method: 'POST', body: JSON.stringify(data) }),
  deleteHighlight: (date: string) => req(`/api/highlights?date=${date}`, { method: 'DELETE' }),

  // 备份
  exportBackup: () => req(`/api/backup`),
};

import type { EventItem, Tag, TimeEntry, Weight, WeightGoal, Diary, Sop, DateHighlight } from '@/lib/types';
