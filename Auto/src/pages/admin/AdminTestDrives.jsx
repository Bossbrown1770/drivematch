import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Clock, Car, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export default function AdminTestDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('test_drives')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setDrives(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('test_drives')
      .update({ status })
      .eq('id', id);
    if (error) toast.error('Update failed: ' + error.message);
    else {
      toast.success('Status updated');
      load();
    }
  };

  const filtered = drives.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    const snap = d.car_snapshot || {};
    return `${d.customer_name} ${d.customer_email} ${snap.make || ''} ${snap.model || ''} ${snap.year || ''}`.toLowerCase().includes(q);
  });

  const totalFees = drives
    .filter(d => d.status !== 'Cancelled')
    .reduce((s, d) => s + (d.booking_fee || 0), 0);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Test Drive Bookings</h1>
          <p className="text-sm text-muted-foreground">{drives.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2">
          <DollarSign className="w-4 h-4" />
          <div>
            <p className="text-xs font-medium text-green-600">Total Fees Collected</p>
            <p className="font-bold">${totalFees.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by customer or vehicle..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No test drive bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filtered.map(drive => {
              const snap = drive.car_snapshot || {};
              return (
                <div key={drive.id} className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{drive.customer_name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[drive.status]}`}>{drive.status}</span>
                        {drive.booking_fee && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Fee: ${drive.booking_fee}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{drive.customer_email}{drive.customer_phone && ` · ${drive.customer_phone}`}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1"><Car className="w-3 h-3" />{snap.year} {snap.make} {snap.model} {snap.trim}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1 text-primary"><Calendar className="w-3 h-3" />{drive.booking_date}</span>
                        <span className="flex items-center gap-1 text-primary"><Clock className="w-3 h-3" />{drive.time_slot}</span>
                      </div>
                      {drive.notes && <p className="text-xs text-muted-foreground italic">"{drive.notes}"</p>}
                    </div>
                    <div className="flex-shrink-0">
                      <Select value={drive.status} onValueChange={v => updateStatus(drive.id, v)}>
                        <SelectTrigger className="h-8 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
