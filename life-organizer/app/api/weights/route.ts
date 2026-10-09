import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await guard();
  if (auth) return auth;

  const supabase = getSupabase();
  const [weights, goal] = await Promise.all([
    supabase.from('weights').select('*').order('recorded_date', { ascending: true }),
    supabase.from('weight_goal').select('*').order('set_at', { ascending: false }).limit(1),
  ]);
  return NextResponse.json({
    weights: weights.data || [],
    goal: goal.data?.[0] || null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();

  if (body._type === 'goal') {
    const { data, error } = await supabase
      .from('weight_goal')
      .insert({ target_kg: body.target_kg, start_kg: body.start_kg || null })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('weights')
    .upsert({
      recorded_date: body.recorded_date,
      weight_kg: body.weight_kg,
      note: body.note || null,
    }, { onConflict: 'recorded_date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
