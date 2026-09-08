import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Car } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export default function MyTestDrives() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const cancelDrive = async (id) => {
    if (!confirm('Cancel this test drive booking?')) return;
    const { error } = await supabase
      .from('test_drives')
      .update({ status: 'Cancelled' })
      .eq('id', id);
    if (!error) {
      setDrives(prev => prev.map(d => d.id === id ? { ...d, status: 'Cancelled' } : d));
      toast.success('Test drive cancelled');
    } else {
      toast.error('Could not cancel booking');
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/my-test-drives' } });
      return;
    }

    const fetchDrives = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_drives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setDrives(data);
      setLoading(false);
    };
    fetchDrives();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold mb-1">My Test Drives</h1>
        <p className="text-muted-foreground text-sm">{drives.length} booking{drives.length !== 1 ? 's' : ''}</p>
      </div>

      {drives.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-bold mb-2">No test drives booked</p>
          <p className="text-muted-foreground mb-6">Find a car you love and book a test drive.</p>
          <Link to="/inventory"><Button>Browse Inventory</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drives.map(drive => {
            const snap = drive.car_snapshot || {};
            return (
              <div key={drive.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {snap.image ? (
                      <img src={snap.image} alt={snap.make} className="w-20 h-14 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Car className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{snap.year} {snap.make} {snap.model} {snap.trim}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[drive.status]}`}>
                          {drive.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" /> {drive.booking_date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {drive.time_slot}
                        </span>
                      </div>
                      {drive.booking_fee && (
                        <p className="text-xs text-muted-foreground">
                          Booking fee: <span className="font-semibold text-primary">${drive.booking_fee}</span>
                          <span className="ml-1 text-green-600">(redeemable toward purchase)</span>
                        </p>
                      )}
                      {drive.notes && (
                        <p className="text-xs text-muted-foreground italic">"{drive.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <Link to={`/cars/${drive.car_id}`}>
                      <Button variant="outline" size="sm">View Car</Button>
                    </Link>
                    {drive.status === 'Pending' && (
                      <Button variant="destructive" size="sm" onClick={() => cancelDrive(drive.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
