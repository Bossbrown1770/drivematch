import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Car } from 'lucide-react';
import { toast } from 'sonner';

// Placeholder email sender – replace with your preferred service (Resend, SendGrid, etc.)
const sendEmail = async (to, subject, body) => {
  console.log(`📧 Sending email to ${to}: ${subject}`, body);
  // Example: await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, subject, body }) });
  // Or use a Supabase Edge Function.
};

export default function OrderPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: `/order/${carId}` } });
      return;
    }

    const fetchCar = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();
      if (data) {
        setCar(data);
        setForm(f => ({ ...f, name: user.user_metadata?.full_name || '', email: user.email || '' }));
      }
      setLoading(false);
    };
    fetchCar();
  }, [carId, user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSubmitting(true);

    // Insert order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        car_id: car.id,
        user_id: user.id,
        car_snapshot: {
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim,
          price: car.price,
          image: car.images?.[0],
        },
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        payment_method: paymentMethod,
        notes: form.notes,
        total_price: car.price,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to place order. Please try again.');
      setSubmitting(false);
      return;
    }

    // Send confirmation email to customer
    await sendEmail(
      form.email,
      `Order Confirmed – ${car.year} ${car.make} ${car.model}`,
      `Hi ${form.name},\n\nThank you for your order! We have received your request for the ${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''} priced at $${car.price?.toLocaleString()}.\n\nPayment Method: ${paymentMethod}\n\nOur team will contact you shortly with payment details to complete your purchase.\n\nThank you for choosing AutoDrive!`
    ).catch(() => {});

    // Send admin notification
    await sendEmail(
      'frankrooney474@gmail.com',
      `🚗 New Order – ${car.year} ${car.make} ${car.model}`,
      `A new order has been placed on AutoDrive.\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n🚗 VEHICLE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nVehicle: ${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}\nCondition: ${car.condition || 'N/A'}\nPrice: $${car.price?.toLocaleString()}\nStock #: ${car.stock_number || 'N/A'}\nLocation: ${car.location || 'N/A'}\nVIN: ${car.vin || 'N/A'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n👤 CUSTOMER DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'Not provided'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n💳 PAYMENT DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nPreferred Payment Method: ${paymentMethod}\nTotal Price: $${car.price?.toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n📝 NOTES\n━━━━━━━━━━━━━━━━━━━━━━━━\n${form.notes || 'No additional notes'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nPlease reply to this email or contact the customer directly to send your payment details.\nOnce payment is received, confirm the transaction in the Admin Dashboard.`
    ).catch(() => {});

    setDone(true);
    setSubmitting(false);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-6" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold">Vehicle not found</p>
        <Link to="/inventory"><Button variant="outline" className="mt-4">Back to Inventory</Button></Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-playfair text-3xl font-bold mb-3">Order Submitted!</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Your inquiry for the <strong>{car.year} {car.make} {car.model}</strong> has been received.
          Our team will contact you at <strong>{form.email}</strong> to arrange payment via <strong>{paymentMethod}</strong>.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-8 text-left max-w-sm mx-auto">
          ℹ️ No payment has been processed. Payment will be arranged offline with our team.
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/inventory"><Button variant="outline">Browse More Cars</Button></Link>
          <Link to="/orders"><Button>View My Orders</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mb-1">Complete Your Order</h1>
          <p className="text-muted-foreground text-sm mb-6">Fill in your details and select a payment method. No payment is processed online.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h2 className="font-semibold">Your Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h2 className="font-semibold">Select Payment Method</h2>
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>

            {/* Notes */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h2 className="font-semibold">Additional Notes</h2>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any questions or special requests..."
                rows={3}
              />
            </div>

            <Button type="submit" size="lg" className="w-full h-12 font-semibold" disabled={submitting || !paymentMethod}>
              {submitting ? 'Submitting...' : 'Submit Order Inquiry'}
            </Button>
          </form>
        </div>

        {/* Car Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            {car.images?.[0] && (
              <img src={car.images[0]} alt="Car" className="w-full aspect-[16/9] object-cover rounded-xl mb-4" />
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{car.year} {car.make} {car.model}</p>
                {car.trim && <p className="text-xs text-muted-foreground">{car.trim}</p>}
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              {car.condition && <div className="flex justify-between"><span className="text-muted-foreground">Condition</span><span>{car.condition}</span></div>}
              {car.mileage != null && <div className="flex justify-between"><span className="text-muted-foreground">Mileage</span><span>{car.mileage.toLocaleString()} {car.mileage_unit}</span></div>}
              {car.fuel_type && <div className="flex justify-between"><span className="text-muted-foreground">Fuel</span><span>{car.fuel_type}</span></div>}
              {car.transmission && <div className="flex justify-between"><span className="text-muted-foreground">Transmission</span><span>{car.transmission}</span></div>}
              {car.location && <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{car.location}</span></div>}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Asking Price</span>
              <span className="text-xl font-bold text-primary">${car.price?.toLocaleString()}</span>
            </div>
            {car.has_financing && car.monthly_payment && (
              <p className="text-xs text-green-600 text-right mt-1">Financing from ${car.monthly_payment}/month</p>
            )}
            {paymentMethod && (
              <div className="mt-3 p-2.5 bg-primary/5 rounded-lg text-xs text-center text-primary font-medium">
                Payment: {paymentMethod}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
