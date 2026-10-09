// 全局类型定义

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon: string;
  category: 'time' | 'event';
  target_minutes_per_week?: number | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;        // ISO string
  end_at?: string | null;
  all_day: boolean;
  color: string;
  tag_id?: string | null;
  reminder_minutes?: number | null;
  repeat_rule?: 'daily' | 'weekly' | 'monthly' | null;
  parent_event_id?: string | null;
  sop_id?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  tag?: Tag;
}

export interface TimeEntry {
  id: string;
  tag_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  note?: string | null;
  created_at: string;
  tag?: Tag;
}

export interface Weight {
  id: string;
  recorded_date: string;
  weight_kg: number;
  note?: string | null;
  created_at: string;
}

export interface WeightGoal {
  id: string;
  target_kg: number;
  start_kg?: number | null;
  set_at: string;
}

export interface Diary {
  id: string;
  diary_date: string;
  content: string;
  mood?: string | null;
  weather?: string | null;
  image_urls?: string[] | null;
  source: 'manual' | 'ocr';
  linked_event_ids?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SopStep {
  title: string;
  detail?: string;
  duration: number;   // 分钟
  order: number;
}

export interface Sop {
  id: string;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  steps: SopStep[];
  total_minutes: number;
  category?: string | null;
  times_executed: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DateHighlight {
  highlight_date: string;
  color: string;
  label?: string | null;
}
