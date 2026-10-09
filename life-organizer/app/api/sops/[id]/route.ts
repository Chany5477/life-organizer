import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guard } from '@/lib/api-helper';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await guard();
  if (auth) return auth;

  const body = await req.json();
  const supabase = getSupabase();
  if (Array.isArray(body.steps)) {
    body.total_minutes = body.steps.reduce((s: number, x: any) => s + (Number(x.duration) || 0), 0);
  }
  const { data, error } = await supabase.from('sops').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await guard();
  if (auth) return auth;
  const supabase = getSupabase();
  await supabase.from('sop_executions').delete().eq('sop_id', params.id);
  const { error } = await supabase.from('sops').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
