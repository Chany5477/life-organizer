import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

// GET - 导出全部数据
export async function GET() {
  const auth = await guard();
  if (auth) return auth;

  const supabase = getSupabase();
  const [tags, events, time, weights, weightGoal, diaries, sops, highlights, settings] = await Promise.all([
    supabase.from('tags').select('*'),
    supabase.from('events').select('*'),
    supabase.from('time_entries').select('*'),
    supabase.from('weights').select('*'),
    supabase.from('weight_goal').select('*'),
    supabase.from('diaries').select('*'),
    supabase.from('sops').select('*'),
    supabase.from('date_highlights').select('*'),
    supabase.from('settings').select('*'),
  ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    version: 1,
    data: {
      tags: tags.data || [],
      events: events.data || [],
      time_entries: time.data || [],
      weights: weights.data || [],
      weight_goal: weightGoal.data || [],
      diaries: diaries.data || [],
      sops: sops.data || [],
      highlights: highlights.data || [],
      settings: settings.data || [],
    },
  });
}
