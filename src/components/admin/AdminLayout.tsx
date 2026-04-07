import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Loader2, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminLayout = () => {
  const { isAdmin, loading } = useAdminRole();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);

  // 🔥 Fetch admin user
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8081/api/v1/users/me',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
            }
          }
        );
        setAdmin(res.data.data.user);
      } catch (err) {
        console.error('Admin fetch error:', err);
      }
    };

    fetchAdmin();
  }, []);

  // 🔥 Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8081/api/v1/admin/dashboard',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
            }
          }
        );
        setStats(res.data.data);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    if (location.pathname.includes('users')) return 'Users';
    if (location.pathname.includes('trips')) return 'Trips';
    if (location.pathname.includes('audit')) return 'Audit Logs';
    if (location.pathname.includes('verifications')) return 'Verifications';
    return 'Admin';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/40">

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main */}
        <div className="flex-1 flex flex-col">

          {/* 🔥 HEADER */}
          <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur px-6">
            
            {/* Left */}
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Admin Info */}
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {admin?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {admin?.email || 'Admin'}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.removeItem('jwt_token');
                  window.location.href = '/login';
                }}
                className="text-sm text-muted-foreground hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </header>

          {/* 🔥 STATS BAR */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 border-b bg-background">
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-lg font-semibold">{stats.users}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-xs text-muted-foreground">Trips</p>
                <p className="text-lg font-semibold">{stats.trips}</p>
              </div>
            </div>
          )}

          {/* 🔥 PAGE CONTENT */}
          <main className="flex-1 overflow-auto p-6">

            {/* Breadcrumb */}
            <div className="text-sm text-muted-foreground mb-4">
              Admin / {getPageTitle()}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;