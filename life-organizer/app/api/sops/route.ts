import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await guard();
  if (auth) return auth;

  const supabase = getSupabase();
  const { data, error } = await supabase.from('sops').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();

  // 自动计算总用时
  const total = (body.steps || []).reduce((sum: number, s: any) => sum + (Number(s.duration) || 0), 0);

  const { data, error } = await supabase
    .from('sops')
    .insert({
      title: body.title,
      description: body.description || null,
      icon: body.icon || 'list',
      color: body.color || '#06b6d4',
      steps: body.steps || [],
      total_minutes: total,
      category: body.category || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
