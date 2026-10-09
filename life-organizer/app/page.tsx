import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth-edge';

export const runtime = 'nodejs';

export default function Home() {
  const token = cookies().get('life_organizer_session')?.value;
  if (token) {
    // 验证通过则进入主应用
    redirect('/plan');
  } else {
    redirect('/login');
  }
  return null;
}
