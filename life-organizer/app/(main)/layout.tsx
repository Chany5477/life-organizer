import BottomNav from '@/components/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
