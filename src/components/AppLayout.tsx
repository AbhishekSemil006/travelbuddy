import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { NotificationBell } from './NotificationBell';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-20 pt-14">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5 text-primary">
          <img src="/logo.png" alt="TravelBuddy" className="h-8 w-8 object-contain" />
          <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            TravelBuddy
          </span>
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
