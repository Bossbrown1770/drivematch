import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) toast.error('Update failed: ' + error.message);
    else {
      toast.success('Order status updated');
      load();
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    const snap = o.car_snapshot || {};
    return `${o.customer_name} ${o.customer_email} ${snap.make || ''} ${snap.model || ''} ${snap.year || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by customer or car..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><p className="font-semibold">No orders found</p></div>
        ) : (
          <div className="space-y-4 p-4">
            {filtered.map(order => {
              const snap = order.car_snapshot || {};
              return (
                <div key={order.id} className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{order.customer_name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.customer_email}</span>
                        {order.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_phone}</span>}
                      </div>
                      <p className="text-xs mt-1">
                        <span className="text-muted-foreground">Vehicle: </span>
                        <span className="font-medium">{snap.year} {snap.make} {snap.model} {snap.trim}</span>
                        {snap.price && <span className="text-primary font-semibold ml-2">${snap.price?.toLocaleString()}</span>}
                      </p>
                      <p className="text-xs">
                        <span className="text-muted-foreground">Payment: </span>
                        <span className="font-medium">{order.payment_method}</span>
                      </p>
                      {order.notes && <p className="text-xs text-muted-foreground italic">"{order.notes}"</p>}
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
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
