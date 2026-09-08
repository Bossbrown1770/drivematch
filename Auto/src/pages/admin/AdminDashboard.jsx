import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Car, Users, ShoppingBag, TrendingUp, Clock, CalendarDays } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, to }) => (
  <Link to={to}>
    <div className={`bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-3xl font-bold font-playfair">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    cars: 0,
    orders: 0,
    users: 0,
    pending: 0,
    testDrives: 0,
    pendingDrives: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch all counts in parallel
      const [
        { count: carsCount, error: carsError },
        { count: ordersCount, error: ordersError },
        { count: usersCount, error: usersError },
        { count: testDrivesCount, error: testDrivesError },
        { count: pendingOrdersCount, error: pendingError },
        { count: pendingDrivesCount, error: pendingDrivesError },
      ] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('test_drives').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      ]);

      setStats({
        cars: carsCount || 0,
        orders: ordersCount || 0,
        users: usersCount || 0,
        testDrives: testDrivesCount || 0,
        pending: pendingOrdersCount || 0,
        pendingDrives: pendingDrivesCount || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Vehicles" value={stats.cars} icon={Car} color="bg-primary" to="/admin/cars" />
        <StatCard label="Total Orders" value={stats.orders} icon={ShoppingBag} color="bg-green-500" to="/admin/orders" />
        <StatCard label="Pending Orders" value={stats.pending} icon={Clock} color="bg-amber-500" to="/admin/orders" />
        <StatCard label="Registered Users" value={stats.users} icon={Users} color="bg-purple-500" to="/admin/users" />
        <StatCard label="Test Drive Bookings" value={stats.testDrives} icon={CalendarDays} color="bg-sky-500" to="/admin/test-drives" />
        <StatCard label="Pending Test Drives" value={stats.pendingDrives} icon={Clock} color="bg-orange-400" to="/admin/test-drives" />
      </div>

      {/* Quick Links */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/admin/cars/new" className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Add New Car</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">View Orders</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </Link>
          <Link to="/admin/test-drives" className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
            <CalendarDays className="w-5 h-5 text-sky-500" />
            <span className="text-sm font-medium">View Test Drives</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
