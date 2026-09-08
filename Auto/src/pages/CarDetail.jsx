import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import ImageGallery from '@/components/cars/ImageGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin, Phone, Gauge, Fuel, Calendar, Settings, ArrowLeft,
  CheckCircle, Info, DollarSign, Car, Shield, Wrench
} from 'lucide-react';

const Field = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
    </div>
    {children}
  </div>
);

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setCar(data);
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-8 bg-muted rounded w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 aspect-[16/9] bg-muted rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );

  if (!car) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <Car className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-playfair text-3xl font-bold mb-2">Vehicle Not Found</h2>
      <p className="text-muted-foreground mb-6">This listing may have been removed or the link is invalid.</p>
      <Link to="/inventory"><Button>Browse Inventory</Button></Link>
    </div>
  );

  const formatPrice = (p) => p ? `$${p.toLocaleString()}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to inventory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Details */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={(car.images || []).slice(0, 20)} />

          {car.description && (
            <Section title="About This Vehicle" icon={Info}>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{car.description}</p>
            </Section>
          )}

          <Section title="Technical Specifications" icon={Settings}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Engine" value={car.engine_size} />
              <Field label="Fuel Type" value={car.fuel_type} />
              <Field label="Transmission" value={car.transmission} />
              <Field label="Drivetrain" value={car.drivetrain} />
              <Field label="Horsepower" value={car.horsepower ? `${car.horsepower} hp` : null} />
              <Field label="Body Style" value={car.body_style} />
              <Field label="Fuel City" value={car.fuel_consumption_city} />
              <Field label="Fuel Hwy" value={car.fuel_consumption_highway} />
            </div>
          </Section>

          <Section title="Condition & History" icon={Wrench}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Condition" value={car.condition} />
              <Field label="Mileage" value={car.mileage != null ? `${car.mileage.toLocaleString()} ${car.mileage_unit || 'mi'}` : null} />
              <Field label="Title Status" value={car.title_status} />
              <Field label="Previous Owners" value={car.previous_owners} />
              <Field label="Accident History" value={car.accident_history} />
              <Field label="VIN" value={car.vin} />
            </div>
            {car.service_history && (
              <div className="mt-3 pt-3 border-t border-border">
                <Field label="Service History" value={car.service_history} />
              </div>
            )}
          </Section>

          <Section title="Appearance" icon={Car}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Exterior Color" value={car.exterior_color} />
              <Field label="Interior Color" value={car.interior_color} />
              <Field label="Interior Material" value={car.interior_material} />
            </div>
          </Section>

          {(car.key_features?.length > 0 || car.safety_features?.length > 0) && (
            <Section title="Features & Safety" icon={Shield}>
              {car.key_features?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {car.key_features.map(f => (
                      <Badge key={f} variant="secondary" className="gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {car.safety_features?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Safety Features</p>
                  <div className="flex flex-wrap gap-2">
                    {car.safety_features.map(f => (
                      <Badge key={f} variant="outline" className="gap-1.5">
                        <Shield className="w-3 h-3 text-blue-500" /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {car.modifications && (
                <div className="mt-4 pt-3 border-t border-border">
                  <Field label="Modifications / Upgrades" value={car.modifications} />
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Right: Pricing + CTA */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 sticky top-24">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-sm text-muted-foreground">{car.year}</p>
                <h1 className="font-playfair text-xl sm:text-2xl font-bold leading-tight">
                  {car.make} {car.model}
                  {car.trim && <span className="text-muted-foreground text-lg"> {car.trim}</span>}
                </h1>
              </div>
              {car.condition && <Badge className="flex-shrink-0">{car.condition}</Badge>}
            </div>

            <p className="text-3xl font-bold text-primary mt-3">{formatPrice(car.price)}</p>
            {car.has_financing && car.monthly_payment && (
              <p className="text-sm text-green-600 font-medium mt-1">From ${car.monthly_payment}/month</p>
            )}

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              {car.mileage != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span>{car.mileage.toLocaleString()} {car.mileage_unit || 'mi'}</span>
                </div>
              )}
              {car.fuel_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span>{car.fuel_type}</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>{car.transmission}</span>
                </div>
              )}
              {car.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{car.location}</span>
                </div>
              )}
            </div>

            {car.status !== 'Sold' ? (
              <div className="space-y-2">
                <Link to={user ? `/order/${car.id}` : '/login'} state={{ from: `/order/${car.id}` }}>
                  <Button className="w-full h-11 font-semibold" size="lg">
                    {user ? 'Proceed to Order' : 'Sign In to Order'}
                  </Button>
                </Link>
                <Link to={user ? `/test-drive/${car.id}` : '/login'} state={{ from: `/test-drive/${car.id}` }}>
                  <Button variant="outline" className="w-full h-11 font-semibold gap-2" size="lg">
                    <Calendar className="w-4 h-4" />
                    Book a Test Drive · $49
                  </Button>
                </Link>
              </div>
            ) : (
              <Button disabled className="w-full h-11" size="lg">This Vehicle is Sold</Button>
            )}

            {car.contact_phone && (
              <a href={`tel:${car.contact_phone}`} className="flex items-center justify-center gap-2 mt-3 text-sm text-primary hover:underline">
                <Phone className="w-4 h-4" /> {car.contact_phone}
              </a>
            )}

            {car.has_financing && (
              <>
                <Separator className="my-4" />
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="font-semibold text-sm text-green-700">Financing Available</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {car.down_payment && <div><span className="text-muted-foreground">Down:</span> <span className="font-medium">{formatPrice(car.down_payment)}</span></div>}
                    {car.down_payment_percentage && <div><span className="text-muted-foreground">Down %:</span> <span className="font-medium">{car.down_payment_percentage}%</span></div>}
                    {car.monthly_payment && <div><span className="text-muted-foreground">Monthly:</span> <span className="font-medium">{formatPrice(car.monthly_payment)}</span></div>}
                    {car.loan_term_months && <div><span className="text-muted-foreground">Term:</span> <span className="font-medium">{car.loan_term_months} mo</span></div>}
                    {car.interest_rate && <div><span className="text-muted-foreground">Rate:</span> <span className="font-medium">{car.interest_rate}%</span></div>}
                  </div>
                  {car.financing_notes && <p className="text-xs text-muted-foreground mt-2">{car.financing_notes}</p>}
                </div>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              {car.stock_number && <Field label="Stock #" value={car.stock_number} />}
              {car.location && <Field label="Location" value={car.location} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
