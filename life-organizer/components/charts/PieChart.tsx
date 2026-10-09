'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TimeEntry, Tag } from '@/lib/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  entries: TimeEntry[];
  tags: Tag[];
}

export default function PieChart({ entries, tags }: Props) {
  const tagMap = new Map(tags.map((t) => [t.id, t]));
  const total: Record<string, number> = {};
  for (const e of entries) {
    if (!e.duration_seconds) continue;
    const key = e.tag_id || '__none';
    total[key] = (total[key] || 0) + e.duration_seconds / 60;
  }

  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];
  for (const [tagId, minutes] of Object.entries(total)) {
    const tag = tagMap.get(tagId);
    labels.push(tag?.name || '未分类');
    data.push(minutes);
    colors.push(tag?.color || '#9ca3af');
  }

  if (data.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-10">暂无数据</div>;
  }

  return (
    <div className="h-64">
      <Pie
        data={{ labels, datasets: [{ data, backgroundColor: colors }] }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `${ctx.label}: ${Math.round(ctx.parsed)} 分钟`,
              },
            },
          },
        }}
      />
    </div>
  );
}
