-- ====================================================================
-- Life Organizer 数据库结构
-- 在 Supabase 控制台的 SQL Editor 中一次性运行本文件即可
-- ====================================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. 标签表（总结模块和时间记账共用）
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  icon TEXT DEFAULT 'tag',
  category TEXT DEFAULT 'time',          -- 'time' 时间标签 | 'event' 事件标签
  target_minutes_per_week INT,           -- 周目标分钟数（可选）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. 计划事件表
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#7c3aed',
  tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  reminder_minutes INT,                  -- 提前提醒分钟数：5/15/30/60/1440；NULL=不提醒
  repeat_rule TEXT,                      -- 'daily'|'weekly'|'monthly'|null
  parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,  -- 由 SOP 展开的子事件
  sop_id UUID,                           -- 关联 SOP 模板
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. 时间记账表（总结模块）
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,                  -- 实际秒数
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. 体重表
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recorded_date DATE NOT NULL UNIQUE,
  weight_kg NUMERIC(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. 体重目标
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weight_goal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_kg NUMERIC(5,2) NOT NULL,
  start_kg NUMERIC(5,2),
  set_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 6. 日记表
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,                              -- 'great'|'good'|'normal'|'bad' 可选
  weather TEXT,
  image_urls TEXT[],                      -- 图片 URL 数组
  source TEXT DEFAULT 'manual',           -- 'manual'|'ocr'
  linked_event_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(diary_date DESC);

-- ----------------------------------------------------------------
-- 7. SOP 模板表
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'list',
  color TEXT DEFAULT '#06b6d4',
  steps JSONB NOT NULL,                   -- [{title, duration, detail, order}]
  total_minutes INT DEFAULT 0,
  category TEXT,                         -- 分类标签
  times_executed INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 8. SOP 执行记录
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sop_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  step_completions JSONB,                -- [{stepIndex, completed, actualMinutes}]
  actual_minutes INT,
  linked_event_id UUID,
  notes TEXT
);

-- ----------------------------------------------------------------
-- 9. 月度高亮 / 标记日（年视图用）
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS date_highlights (
  highlight_date DATE PRIMARY KEY,
  color TEXT DEFAULT '#ef4444',
  label TEXT
);

-- ----------------------------------------------------------------
-- 10. 设置表（保存用户的偏好）
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化默认设置
INSERT INTO settings(key, value) VALUES
  ('theme', '"auto"'),
  ('default_view', '"month"'),
  ('reminder_default_minutes', '15'),
  ('week_start', '"monday"'),
  ('ocr_language', '"chi_sim+eng"')
ON CONFLICT (key) DO NOTHING;

-- 初始化内置标签
INSERT INTO tags(name, color, icon, category) VALUES
  ('有氧', '#ef4444', 'heart-pulse', 'time'),
  ('学习', '#3b82f6', 'book-open', 'time'),
  ('工作', '#8b5cf6', 'briefcase', 'time'),
  ('阅读', '#10b981', 'book', 'time'),
  ('运动', '#f59e0b', 'dumbbell', 'time'),
  ('休息', '#6b7280', 'coffee', 'time'),
  ('社交', '#ec4899', 'users', 'time'),
  ('创作', '#06b6d4', 'pen-tool', 'time'),
  ('冥想', '#a855f7', 'wind', 'time'),
  ('家务', '#84cc16', 'home', 'time')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 通用 updated_at 触发器
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_events ON events;
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_diaries ON diaries;
CREATE TRIGGER set_updated_at_diaries BEFORE UPDATE ON diaries
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_sops ON sops;
CREATE TRIGGER set_updated_at_sops BEFORE UPDATE ON sops
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------
-- RLS（行级安全策略）：应用端使用 anon key 写入
-- 启用 RLS 是 Supabase 推荐做法。我们单用户使用，可以直接允许所有操作
-- ----------------------------------------------------------------
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 单人使用：开发阶段全部允许
DROP POLICY IF EXISTS "allow all anon" ON tags;
DROP POLICY IF EXISTS "allow all anon" ON events;
DROP POLICY IF EXISTS "allow all anon" ON time_entries;
DROP POLICY IF EXISTS "allow all anon" ON weights;
DROP POLICY IF EXISTS "allow all anon" ON weight_goal;
DROP POLICY IF EXISTS "allow all anon" ON diaries;
DROP POLICY IF EXISTS "allow all anon" ON sops;
DROP POLICY IF EXISTS "allow all anon" ON sop_executions;
DROP POLICY IF EXISTS "allow all anon" ON date_highlights;
DROP POLICY IF EXISTS "allow all anon" ON settings;

CREATE POLICY "allow all anon" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON weights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON weight_goal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON diaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON sops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON sop_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON date_highlights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all anon" ON settings FOR ALL USING (true) WITH CHECK (true);
