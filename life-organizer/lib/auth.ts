import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'life_organizer_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

export async function createToken(): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('请在 .env 配置 JWT_SECRET');
  const secretKey = new TextEncoder().encode(secret);

  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.APP_LOGIN_PASSWORD;
  if (!expected) {
    console.error('APP_LOGIN_PASSWORD 未配置！');
    return false;
  }
  // 直接比较（在边缘函数/服务端运行，无时序攻击风险足够）
  return password === expected;
}

export async function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error('UNAUTHORIZED');
  }
}
