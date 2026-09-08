import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Car, Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, CalendarDays, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Inventory', to: '/inventory' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-playfair font-bold text-xl text-foreground">AutoDrive</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    My Orders
                  </Button>
                </Link>
                <Link to="/my-test-drives">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    Test Drives
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              !loading && (
                <Button size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                {link.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Dashboard</Link>
                )}
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">My Orders</Link>
                <Link to="/my-test-drives" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">My Test Drives</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Profile</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Logout</button>
              </>
            ) : (
              !loading && (
                <button onClick={() => navigate('/login')} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-primary">Sign In</button>
              )
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-playfair font-bold text-lg">AutoDrive</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AutoDrive. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/inventory" className="hover:text-foreground transition-colors">Inventory</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
