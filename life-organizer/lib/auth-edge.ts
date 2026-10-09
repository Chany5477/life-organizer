// 在 Edge runtime 也能用的 JWT 验证版本
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'life_organizer_session';

export async function verifyJwt(token: string): Promise<boolean> {
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

export { COOKIE_NAME };
