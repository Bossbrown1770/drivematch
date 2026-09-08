import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Car, CreditCard } from 'lucide-react';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [user, authLoading, navigate]);

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        {Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">Browse our inventory and place your first order.</p>
          <Link to="/inventory"><Button>Browse Cars</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const snap = order.car_snapshot || {};
            return (
              <div key={order.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {snap.year} {snap.make} {snap.model} {snap.trim}
                      </p>
                      <p className="text-xs text-muted-foreground">Order #{order.id?.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {snap.price && (
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-semibold">${snap.price?.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="font-medium text-xs">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {order.notes && (
                  <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-2">{order.notes}</p>
                )}

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    Payment arranged offline — our team will contact you shortly.
                  </p>
                  {order.status === 'Pending' && (
                    <Button variant="destructive" size="sm" className="text-xs h-7" onClick={() => cancelOrder(order.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
