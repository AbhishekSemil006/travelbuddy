import { Bell, Check, Loader2, User, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'join_request':
      return <User className="h-4 w-4 text-amber-500" />;
    case 'request_accepted':
      return <Check className="h-4 w-4 text-emerald-500" />;
    case 'request_declined':
    case 'participant_removed':
      return <User className="h-4 w-4 text-destructive" />;
    case 'new_message':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'trip_update':
      return <MapPin className="h-4 w-4 text-primary" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleDropdownOpen = (isOpen: boolean) => {
    // Optional: could mark all as read automatically on open
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      markAsRead(n._id);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 z-[100]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs gap-1 text-primary hover:bg-transparent hover:underline" onClick={markAllAsRead}>
              <Check className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const linkUrl = notif.type === 'new_message' 
                ? '/messages' 
                : notif.tripId ? `/trips/${notif.tripId}` : '#';

              return (
                <DropdownMenuItem asChild key={notif._id} className="cursor-pointer focus:bg-muted/50 rounded-none border-b last:border-b-0 p-0 overflow-hidden">
                  <Link to={linkUrl} onClick={() => handleNotificationClick(notif)} className={`flex items-start gap-3 p-4 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                    <div className="shrink-0 mt-0.5 relative">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={notif.senderProfile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-muted">
                          {notif.senderProfile?.displayName ? notif.senderProfile.displayName[0].toUpperCase() : <NotificationIcon type={notif.type} />}
                        </AvatarFallback>
                      </Avatar>
                      {notif.senderProfile && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border shadow-sm">
                          <NotificationIcon type={notif.type} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`text-sm leading-tight ${!notif.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="shrink-0 mt-2">
                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
