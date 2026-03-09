-- ============================================================
-- ARES34 — Schema para Tareas del Calendario
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  label VARCHAR(30) DEFAULT '',
  snoozed_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_tasks_user ON calendar_tasks(user_id, status, due_date);
CREATE INDEX idx_calendar_tasks_scheduled ON calendar_tasks(user_id, scheduled_start);

ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks"
  ON calendar_tasks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
  ON calendar_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON calendar_tasks FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"
  ON calendar_tasks FOR DELETE
  USING (auth.uid() = user_id);
