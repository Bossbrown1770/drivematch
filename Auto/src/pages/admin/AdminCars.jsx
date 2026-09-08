import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  Available: 'bg-green-100 text-green-700',
  Sold: 'bg-red-100 text-red-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Hidden: 'bg-gray-100 text-gray-600',
};

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setCars(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) toast.error('Delete failed: ' + error.message);
    else {
      toast.success('Vehicle deleted');
      load();
    }
  };

  const filtered = cars.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.year} ${c.make} ${c.model} ${c.trim || ''} ${c.stock_number || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{cars.length} total</p>
        </div>
        <Link to="/admin/cars/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Vehicle</Button>
        </Link>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold mb-1">No vehicles found</p>
            <Link to="/admin/cars/new"><Button className="mt-3">Add your first car</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vehicle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Featured</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(car => (
                  <tr key={car.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {car.images?.[0] ? (
                          <img src={car.images[0]} alt="" className="w-12 h-8 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-8 bg-muted rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{car.year} {car.make} {car.model}</p>
                          {car.trim && <p className="text-xs text-muted-foreground">{car.trim}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">${car.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[car.status] || 'bg-muted text-muted-foreground'}`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {car.featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4 text-muted-foreground" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/cars/${car.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Link to={`/admin/cars/${car.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(car.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
