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
  let query = supabase.from('date_highlights').select('*');
  if (start) query = query.gte('highlight_date', start);
  if (end) query = query.lte('highlight_date', end);
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
    .from('date_highlights')
    .upsert({ highlight_date: body.highlight_date, color: body.color || '#ef4444', label: body.label || null }, { onConflict: 'highlight_date' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const supabase = getSupabase();
  const { error } = await supabase.from('date_highlights').delete().eq('highlight_date', date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
