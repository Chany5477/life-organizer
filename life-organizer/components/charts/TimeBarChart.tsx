'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TimeEntry, Tag } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  entries: TimeEntry[];
  tags: Tag[];
  granularity: 'day' | 'week' | 'month';
  days: Date[];
}

export default function TimeBarChart({ entries, tags, granularity, days }: Props) {
  // 把每个数据点的累计时长按 tag 拆开
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  // 累计每个时间桶里每个 tag 的分钟数
  const buckets: Record<string, Record<string, number>> = {};
  for (const entry of entries) {
    if (!entry.duration_seconds) continue;
    const d = new Date(entry.started_at);
    const key = bucketKey(d, granularity);
    if (!buckets[key]) buckets[key] = {};
    const tagId = entry.tag_id || '__none';
    buckets[key][tagId] = (buckets[key][tagId] || 0) + entry.duration_seconds / 60;
  }

  // 仅展示参与过的 tag
  const usedTagIds = new Set<string>();
  Object.values(buckets).forEach((b) => Object.keys(b).forEach((k) => usedTagIds.add(k)));

  const labels = days.map((d) => formatLabel(d, granularity));

  const datasets = Array.from(usedTagIds).map((tagId) => {
    const tag = tagMap.get(tagId);
    return {
      label: tag?.name || '未分类',
      data: days.map((d) => buckets[bucketKey(d, granularity)]?.[tagId] || 0),
      backgroundColor: tag?.color || '#9ca3af',
    };
  });

  return (
    <Bar
      data={{ labels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} 分钟`,
            },
          },
        },
        scales: {
          x: { stacked: true, ticks: { font: { size: 10 } } },
          y: { stacked: true, ticks: { font: { size: 10 } } },
        },
      }}
    />
  );
}

function bucketKey(d: Date, g: 'day' | 'week' | 'month') {
  if (g === 'day') return format(d, 'yyyy-MM-dd');
  if (g === 'week') {
    // 取周一为一周开始
    const w = new Date(d);
    w.setDate(w.getDate() - ((w.getDay() + 6) % 7));
    return format(w, 'yyyy-MM-dd');
  }
  return format(d, 'yyyy-MM');
}

function formatLabel(d: Date, g: 'day' | 'week' | 'month') {
  if (g === 'day') return format(d, 'd');
  if (g === 'week') return format(d, 'M/d');
  return format(d, 'M');
}

function format(d: Date, s: string) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (s === 'yyyy-MM-dd') return `${d.getFullYear()}-${m}-${day}`;
  if (s === 'd') return String(d.getDate());
  if (s === 'M/d') return `${parseInt(m)}/${parseInt(day)}`;
  if (s === 'M') return String(parseInt(m));
  if (s === 'yyyy-MM') return `${d.getFullYear()}-${m}`;
  return '';
}
