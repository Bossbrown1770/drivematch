import { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Other'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'];
const BODY_STYLES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Crossover', 'Other'];
const CONDITIONS = ['New', 'Used', 'Certified Pre-Owned'];

export default function FilterSidebar({ filters, onChange, cars }) {
  const makes = [...new Set(cars.map(c => c.make).filter(Boolean))].sort();
  const currentYear = new Date().getFullYear();

  const [localPrice, setLocalPrice] = useState([filters.priceMin || 0, filters.priceMax || 200000]);
  const [localYear, setLocalYear] = useState([filters.yearMin || 2000, filters.yearMax || currentYear]);
  const priceTimer = useRef(null);
  const yearTimer = useRef(null);

  const handlePriceChange = (val) => {
    setLocalPrice(val);
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      onChange({ ...filters, priceMin: val[0] || undefined, priceMax: val[1] < 200000 ? val[1] : undefined });
    }, 300);
  };

  const handleYearChange = (val) => {
    setLocalYear(val);
    clearTimeout(yearTimer.current);
    yearTimer.current = setTimeout(() => {
      onChange({ ...filters, yearMin: val[0] > 2000 ? val[0] : undefined, yearMax: val[1] < currentYear ? val[1] : undefined });
    }, 300);
  };

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.make, filters.fuel_type, filters.transmission, filters.body_style, filters.condition,
    filters.priceMin, filters.priceMax, filters.yearMin, filters.yearMax
  ].filter(Boolean).length;

  const reset = () => onChange({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Filters</span>
          {activeCount > 0 && <Badge variant="secondary" className="text-xs">{activeCount}</Badge>}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Make */}
      <FilterGroup label="Make / Brand">
        <Select value={filters.make || ''} onValueChange={v => set('make', v || undefined)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Any make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Any make</SelectItem>
            {makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup label={`Price Range${localPrice[1] < 200000 ? `: up to $${localPrice[1].toLocaleString()}` : ''}`}>
        <div className="space-y-3">
          <Slider min={0} max={200000} step={1000} value={localPrice} onValueChange={handlePriceChange} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${localPrice[0].toLocaleString()}</span>
            <span>${localPrice[1].toLocaleString()}{localPrice[1] >= 200000 ? '+' : ''}</span>
          </div>
        </div>
      </FilterGroup>

      {/* Year Range */}
      <FilterGroup label={`Year${localYear[0] > 2000 || localYear[1] < currentYear ? `: ${localYear[0]}–${localYear[1]}` : ''}`}>
        <div className="space-y-3">
          <Slider min={2000} max={currentYear} step={1} value={localYear} onValueChange={handleYearChange} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localYear[0]}</span>
            <span>{localYear[1]}</span>
          </div>
        </div>
      </FilterGroup>

      {/* Fuel Type */}
      <FilterGroup label="Fuel Type">
        <div className="flex flex-wrap gap-1.5">
          {FUEL_TYPES.map(f => (
            <button key={f} onClick={() => set('fuel_type', filters.fuel_type === f ? undefined : f)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filters.fuel_type === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
              {f}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Transmission */}
      <FilterGroup label="Transmission">
        <div className="flex flex-wrap gap-1.5">
          {TRANSMISSIONS.map(t => (
            <button key={t} onClick={() => set('transmission', filters.transmission === t ? undefined : t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filters.transmission === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
              {t}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Body Style */}
      <FilterGroup label="Body Style">
        <Select value={filters.body_style || ''} onValueChange={v => set('body_style', v || undefined)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Any style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Any style</SelectItem>
            {BODY_STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      {/* Condition */}
      <FilterGroup label="Condition">
        <div className="flex flex-col gap-1.5">
          {CONDITIONS.map(c => (
            <button key={c} onClick={() => set('condition', filters.condition === c ? undefined : c)}
              className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-colors ${filters.condition === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}
