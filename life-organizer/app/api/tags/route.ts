import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await guard();
  if (auth) return auth;

  const supabase = getSupabase();
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: body.name,
      color: body.color || '#8b5cf6',
      icon: body.icon || 'tag',
      category: body.category || 'time',
      target_minutes_per_week: body.target_minutes_per_week || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
