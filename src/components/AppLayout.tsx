import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { NotificationBell } from './NotificationBell';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-16 pt-14">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur-lg z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-primary">
          <img src="/logo.png" alt="TravelBuddy" className="h-7 w-7 object-contain" />
          <span className="font-display font-bold text-lg text-foreground tracking-tight">TravelBuddy</span>
        </div>
        <NotificationBell />
      </header>

      {/* Main Content */}
      <main className="h-full">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
