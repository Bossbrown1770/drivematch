import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, CheckCircle, Car, CreditCard, AlertCircle } from 'lucide-react';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BOOKING_FEE = 49;
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Placeholder email sender
const sendEmail = async (to, subject, body) => {
  console.log(`📧 Sending email to ${to}: ${subject}`, body);
};

export default function TestDriveBooking() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: `/test-drive/${carId}` } });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Fetch car
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();
      if (carData) setCar(carData);

      // Fetch existing bookings for this car
      const { data: drives, error: drivesError } = await supabase
        .from('test_drives')
        .select('booking_date, time_slot')
        .eq('car_id', carId)
        .not('status', 'eq', 'Cancelled'); // exclude cancelled
      if (drives) {
        setBookedSlots(drives.map(d => `${d.booking_date}|${d.time_slot}`));
      }

      // Pre-fill user info
      if (user) {
        setForm(f => ({ ...f, name: user.user_metadata?.full_name || '', email: user.email || '' }));
      }
      setLoading(false);
    };
    fetchData();
  }, [carId, user, authLoading, navigate]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null); setSelectedSlot(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null); setSelectedSlot(null);
  };

  const isDateDisabled = (day) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t || d.getDay() === 0; // no Sundays, no past
  };

  const isSlotBooked = (slot) => {
    if (!selectedDate) return false;
    return bookedSlots.includes(`${selectedDate}|${slot}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) { toast.error('Please select a date and time slot'); return; }
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSubmitting(true);

    // Double-check availability to avoid race condition
    const { data: existing, error: checkError } = await supabase
      .from('test_drives')
      .select('id')
      .eq('car_id', carId)
      .eq('booking_date', selectedDate)
      .eq('time_slot', selectedSlot)
      .not('status', 'eq', 'Cancelled');
    if (existing && existing.length > 0) {
      toast.error('This time slot was just booked by someone else. Please select another.');
      setBookedSlots(prev => [...prev, `${selectedDate}|${selectedSlot}`]);
      setSelectedSlot(null);
      setSubmitting(false);
      return;
    }

    // Insert booking
    const { data: booking, error } = await supabase
      .from('test_drives')
      .insert({
        car_id: carId,
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
        booking_date: selectedDate,
        time_slot: selectedSlot,
        booking_fee: BOOKING_FEE,
        status: 'Pending',
        notes: form.notes,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to book test drive. Please try again.');
      setSubmitting(false);
      return;
    }

    // Send confirmation email to customer
    await sendEmail(
      form.email,
      `Test Drive Confirmed – ${car.year} ${car.make} ${car.model}`,
      `Hi ${form.name},\n\nYour test drive has been booked!\n\nVehicle: ${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}\nDate: ${selectedDate}\nTime: ${selectedSlot}\nBooking Fee: $${BOOKING_FEE} (redeemable toward purchase)\n\nOur team will contact you shortly with payment details for the booking fee.\n\nThank you for choosing AutoDrive!`
    ).catch(() => {});

    // Send admin notification
    await sendEmail(
      'frankrooney474@gmail.com',
      `📅 New Test Drive Booking – ${car.year} ${car.make} ${car.model}`,
      `A new test drive has been booked on AutoDrive.\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n🚗 VEHICLE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nVehicle: ${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}\nPrice: $${car.price?.toLocaleString()}\nStock #: ${car.stock_number || 'N/A'}\nLocation: ${car.location || 'N/A'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n📅 BOOKING DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nDate: ${selectedDate}\nTime Slot: ${selectedSlot}\nBooking Fee: $${BOOKING_FEE}\nPayment Method: ${paymentMethod}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n👤 CUSTOMER DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'Not provided'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n📝 NOTES\n━━━━━━━━━━━━━━━━━━━━━━━━\n${form.notes || 'No additional notes'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nPlease reply to this email or contact the customer directly to send your payment details for the $${BOOKING_FEE} booking fee.\nOnce payment is received, confirm the booking in the Admin Dashboard.`
    ).catch(() => {});

    setSuccess(true);
    setSubmitting(false);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold">Vehicle not found</p>
        <Link to="/inventory"><Button variant="outline" className="mt-4">Back to Inventory</Button></Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-playfair text-3xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-1">Test drive booked for <strong>{car.year} {car.make} {car.model}</strong></p>
        <p className="text-muted-foreground mb-1"><strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong></p>
        <p className="text-sm text-muted-foreground mb-6">A confirmation will be sent to <strong>{form.email}</strong></p>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-sm">
          <p className="font-semibold text-primary">Booking fee paid: ${BOOKING_FEE}</p>
          <p className="text-muted-foreground mt-1">This fee is redeemable toward your purchase.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to={`/cars/${carId}`}><Button variant="outline">Back to Car</Button></Link>
          <Link to="/my-test-drives"><Button variant="outline">My Test Drives</Button></Link>
          <Link to="/inventory"><Button>Browse More Cars</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold mb-1">Book a Test Drive</h1>
        <p className="text-muted-foreground">{car.year} {car.make} {car.model} {car.trim}</p>
      </div>

      {/* Fee Banner */}
      <div className="flex items-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 mb-8">
        <CreditCard className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Booking Fee: ${BOOKING_FEE}</p>
          <p className="text-sm text-primary-foreground/80">Fully redeemable toward the purchase price of this vehicle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calendar + Slots */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calendar */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <p className="font-semibold">{monthName} {calYear}</p>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors rotate-180">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const disabled = isDateDisabled(day);
                const selected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-medium transition-all",
                      disabled ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-primary/10",
                      selected ? "bg-primary text-primary-foreground hover:bg-primary" : ""
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold">Available Time Slots</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => {
                  const booked = isSlotBooked(slot);
                  const selected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={booked}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                        booked ? "border-border bg-muted text-muted-foreground/50 cursor-not-allowed line-through" : "",
                        selected ? "border-primary bg-primary text-primary-foreground" : !booked ? "border-border hover:border-primary/50" : ""
                      )}
                    >
                      {booked ? 'Booked' : slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            {/* Car Summary */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
              <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {car.images?.[0] ? (
                  <img src={car.images[0]} alt={car.make} className="w-full h-full object-cover" />
                ) : <Car className="w-6 h-6 text-muted-foreground m-auto mt-3" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{car.year} {car.make} {car.model}</p>
                <p className="text-xs text-muted-foreground">{car.trim}</p>
                <p className="text-sm font-bold text-primary">${car.price?.toLocaleString()}</p>
              </div>
            </div>

            {selectedDate && selectedSlot ? (
              <div className="flex items-center gap-2 mb-5 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium text-primary">{selectedDate} · {selectedSlot}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-5 p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Select a date and time slot</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="John Smith" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@email.com" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Any special requests..." rows={2} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Payment Method *</Label>
                <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
              </div>

              <div className="pt-2 border-t border-border space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Booking fee</span><span>${BOOKING_FEE}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total due now</span><span className="text-primary">${BOOKING_FEE}</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting || !selectedDate || !selectedSlot || !paymentMethod}>
                {submitting ? 'Booking...' : `Confirm & Pay $${BOOKING_FEE}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
