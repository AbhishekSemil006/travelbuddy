import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Map, MessageCircle, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-primary to-orange-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn('h-5 w-5 transition-all', isActive && 'stroke-[2.5] scale-105')} />
              <span className={cn('font-medium', isActive && 'font-bold text-[11px]')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
