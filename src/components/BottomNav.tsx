import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Map, MessageCircle, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Explore', icon: Compass, path: '/' },
  { label: 'Trips', icon: Map, path: '/trips' },
  { label: 'Messages', icon: MessageCircle, path: '/messages' },
  { label: 'Safety', icon: Shield, path: '/safety' },
  { label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('font-medium', isActive && 'font-semibold')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
