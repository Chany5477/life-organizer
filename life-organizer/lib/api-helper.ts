import { NextResponse } from 'next/server';
import { isAuthenticated } from './auth';

// 用于 API 路由的统一响应辅助
export async function guard() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export function ok(data: any) {
  return NextResponse.json(data);
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
