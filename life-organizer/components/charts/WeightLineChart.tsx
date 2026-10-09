'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Weight, WeightGoal } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  weights: Weight[];
  goal: WeightGoal | null;
}

export default function WeightLineChart({ weights, goal }: Props) {
  const labels = weights.map((w) => w.recorded_date);
  const dataPoints = weights.map((w) => Number(w.weight_kg));

  if (weights.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-10">还没有体重数据</div>;
  }

  const datasets: any[] = [
    {
      label: '体重 (kg)',
      data: dataPoints,
      borderColor: '#7c3aed',
      backgroundColor: '#7c3aed55',
      tension: 0.3,
      pointRadius: 4,
    },
  ];

  if (goal?.target_kg) {
    datasets.push({
      label: `目标 ${goal.target_kg}kg`,
      data: Array(weights.length).fill(Number(goal.target_kg)),
      borderColor: '#10b981',
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
    });
  }

  return (
    <Line
      data={{ labels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } },
        },
        scales: {
          y: { ticks: { font: { size: 10 } } },
          x: { ticks: { font: { size: 10 } } },
        },
      }}
    />
  );
}
