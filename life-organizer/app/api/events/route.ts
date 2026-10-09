import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

// GET - 获取事件列表（可按日期筛选）
export async function GET(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const supabase = getSupabase();
  let query = supabase.from('events').select('*, tag:tags(*)').order('start_at', { ascending: true });
  if (start) query = query.gte('start_at', start);
  if (end) query = query.lte('start_at', end);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST - 创建事件
export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();

  const insertData: any = {
    title: body.title,
    description: body.description || null,
    start_at: body.start_at,
    end_at: body.end_at || null,
    all_day: body.all_day ?? false,
    color: body.color || '#7c3aed',
    tag_id: body.tag_id || null,
    reminder_minutes: body.reminder_minutes ?? null,
    repeat_rule: body.repeat_rule || null,
    sop_id: body.sop_id || null,
    parent_event_id: body.parent_event_id || null,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 如果是重复事件，为未来N期生成实例
  if (body.repeat_rule && body.repeat_until) {
    const until = new Date(body.repeat_until);
    const inc = body.repeat_rule === 'daily' ? 1 : body.repeat_rule === 'weekly' ? 7 : 30;
    const startDate = new Date(data.start_at);
    const endDate = data.end_at ? new Date(data.end_at) : null;
    const duration = endDate ? (endDate.getTime() - startDate.getTime()) : 0;
    const copies: any[] = [];
    let nextDate = new Date(startDate);
    while (true) {
      nextDate = new Date(nextDate);
      nextDate.setDate(nextDate.getDate() + inc);
      if (nextDate > until) break;
      copies.push({
        title: data.title,
        description: data.description,
        start_at: nextDate.toISOString(),
        end_at: endDate ? new Date(nextDate.getTime() + duration).toISOString() : null,
        all_day: data.all_day ?? false,
        color: data.color,
        tag_id: data.tag_id,
        reminder_minutes: data.reminder_minutes,
        repeat_rule: data.repeat_rule,
      });
      if (copies.length > 365) break;
    }
    if (copies.length > 0) {
      await supabase.from('events').insert(copies);
    }
  }

  return NextResponse.json(data);
}
