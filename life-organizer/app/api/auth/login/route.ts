import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setAuthCookie, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false, error: '请输入密码' }, { status: 400 });
    }

    const ok = await verifyPassword(password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: '密码不正确' }, { status: 401 });
    }

    const token = await createToken();
    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('login error:', e);
    return NextResponse.json({ ok: false, error: '服务器错误' }, { status: 500 });
  }
}
