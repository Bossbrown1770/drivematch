import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CarCard from '@/components/cars/CarCard';
import FilterSidebar from '@/components/cars/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PAGE_SIZE = 12;

export default function Inventory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setCars(data);
      setLoading(false);
    };
    fetchCars();
  }, []);

  const filtered = useMemo(() => {
    let res = cars.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${c.year} ${c.make} ${c.model} ${c.trim} ${c.description || ''}`.toLowerCase().includes(q)) return false;
      }
      if (filters.make && c.make !== filters.make) return false;
      if (filters.fuel_type && c.fuel_type !== filters.fuel_type) return false;
      if (filters.transmission && c.transmission !== filters.transmission) return false;
      if (filters.body_style && c.body_style !== filters.body_style) return false;
      if (filters.condition && c.condition !== filters.condition) return false;
      if (filters.priceMin && c.price < filters.priceMin) return false;
      if (filters.priceMax && c.price > filters.priceMax) return false;
      if (filters.yearMin && c.year < filters.yearMin) return false;
      if (filters.yearMax && c.year > filters.yearMax) return false;
      return true;
    });

    res = [...res].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'mileage-asc') return (a.mileage || 0) - (b.mileage || 0);
      return 0; // newest = default order from API (created_at desc)
    });

    return res;
  }, [cars, filters, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f) => { setFilters(f); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-1">Vehicle Inventory</h1>
        <p className="text-muted-foreground">{loading ? 'Loading...' : `${filtered.length} vehicles available`}</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, year..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="year-desc">Year: Newest</SelectItem>
            <SelectItem value="mileage-asc">Lowest Mileage</SelectItem>
          </SelectContent>
        </Select>
        {/* Mobile Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden gap-2 h-10">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6">
              <FilterSidebar filters={filters} onChange={handleFilterChange} cars={cars} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-card rounded-2xl border border-border p-5">
            <FilterSidebar filters={filters} onChange={handleFilterChange} cars={cars} />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/60 animate-pulse">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-bold mb-2">No vehicles found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search term.</p>
              <Button variant="outline" onClick={() => { setFilters({}); setSearch(''); }}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map(car => <CarCard key={car.id} car={car} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map((p, i, arr) => (
                    <span key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                      <Button variant={p === page ? 'default' : 'outline'} size="icon" onClick={() => setPage(p)}>{p}</Button>
                    </span>
                  ))}
                  <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
