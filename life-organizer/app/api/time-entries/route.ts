import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const supabase = getSupabase();
  let query = supabase.from('time_entries').select('*, tag:tags(*)').order('started_at', { ascending: false });
  if (start) query = query.gte('started_at', start);
  if (end) query = query.lte('started_at', end);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      tag_id: body.tag_id || null,
      started_at: body.started_at,
      ended_at: body.ended_at || null,
      duration_seconds: body.duration_seconds ?? null,
      note: body.note || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
