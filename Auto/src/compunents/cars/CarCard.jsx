import { Link } from 'react-router-dom';
import { MapPin, Gauge, Fuel, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const conditionColors = {
  'New': 'bg-green-100 text-green-700',
  'Used': 'bg-blue-100 text-blue-700',
  'Certified Pre-Owned': 'bg-purple-100 text-purple-700',
};

export default function CarCard({ car }) {
  const mainImage = car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80';
  const formatPrice = (p) => p ? `$${p.toLocaleString()}` : 'Price on request';

  return (
    <Link to={`/cars/${car.id}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {car.condition && (
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", conditionColors[car.condition] || 'bg-muted text-muted-foreground')}>
                {car.condition}
              </span>
            )}
            {car.featured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                Featured
              </span>
            )}
          </div>
          {car.status === 'Sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xl bg-red-500 px-4 py-1.5 rounded-full">SOLD</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{car.year}</p>
              <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
                {car.make} {car.model} {car.trim}
              </h3>
            </div>
            <p className="text-lg font-bold text-primary whitespace-nowrap">{formatPrice(car.price)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60">
            {car.mileage != null && (
              <div className="flex flex-col items-center gap-0.5">
                <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.mileage.toLocaleString()} {car.mileage_unit || 'mi'}</span>
              </div>
            )}
            {car.fuel_type && (
              <div className="flex flex-col items-center gap-0.5">
                <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.fuel_type}</span>
              </div>
            )}
            {car.transmission && (
              <div className="flex flex-col items-center gap-0.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.transmission}</span>
              </div>
            )}
          </div>

          {car.location && (
            <div className="flex items-center gap-1 mt-2.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {car.location}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            {car.has_financing && car.monthly_payment ? (
              <span className="text-xs text-green-600 font-medium">From ${car.monthly_payment}/mo</span>
            ) : <span />}
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              View Details <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
