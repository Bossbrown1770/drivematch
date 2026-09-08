import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Car, Users, ShoppingBag, LayoutDashboard, ChevronRight, LogOut, CalendarDays } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/cars', label: 'Cars', icon: Car },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/test-drives', label: 'Test Drives', icon: CalendarDays },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 flex-shrink-0 bg-sidebar min-h-screen flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-playfair font-bold text-sidebar-foreground text-lg">AutoDrive</span>
        </Link>
        <p className="text-xs text-sidebar-foreground/50 mt-1 ml-10">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link key={to} to={to}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
              <Icon className="w-4 h-4" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
