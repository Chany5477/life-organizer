import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const supabase = getSupabase();
  let query = supabase.from('diaries').select('*').order('diary_date', { ascending: false });
  if (date) query = query.eq('diary_date', date).limit(1);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(date ? data?.[0] || null : data || []);
}

export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();

  // upsert by diary_date
  const { data, error } = await supabase
    .from('diaries')
    .upsert({
      diary_date: body.diary_date,
      content: body.content,
      mood: body.mood || null,
      weather: body.weather || null,
      image_urls: body.image_urls || null,
      source: body.source || 'manual',
      linked_event_ids: body.linked_event_ids || null,
    }, { onConflict: 'diary_date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
