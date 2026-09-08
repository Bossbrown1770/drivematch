import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold">Access Denied</p>
          <p className="text-muted-foreground">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
