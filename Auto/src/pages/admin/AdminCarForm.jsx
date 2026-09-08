import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { uploadCarImage } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL = {
  year: new Date().getFullYear(),
  make: '',
  model: '',
  trim: '',
  body_style: '',
  vin: '',
  condition: 'Used',
  mileage: '',
  mileage_unit: 'miles',
  title_status: 'Clean',
  previous_owners: '',
  accident_history: '',
  service_history: '',
  engine_size: '',
  fuel_type: 'Petrol',
  transmission: 'Automatic',
  drivetrain: '',
  horsepower: '',
  fuel_consumption_city: '',
  fuel_consumption_highway: '',
  exterior_color: '',
  interior_color: '',
  interior_material: '',
  key_features: [],
  safety_features: [],
  modifications: '',
  price: '',
  location: '',
  stock_number: '',
  contact_phone: '',
  description: '',
  images: [],
  featured: false,
  status: 'Available',
  has_financing: false,
  down_payment: '',
  down_payment_percentage: '',
  monthly_payment: '',
  loan_term_months: '',
  interest_rate: '',
  financing_notes: '',
};

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
    {children}
  </div>
);

const SelectField = ({ label, value, onChange, options, required, placeholder }) => (
  <FormField label={label} required={required}>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder || `Select ${label}`} /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  </FormField>
);

export default function AdminCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newSafety, setNewSafety] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchCar = async () => {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();
        if (data) {
          // Ensure arrays are properly set
          setForm({ ...INITIAL, ...data });
        }
        setLoading(false);
      };
      fetchCar();
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if ((form.images?.length || 0) + files.length > 20) {
      toast.error('Maximum 20 images allowed');
      return;
    }
    setUploadingImage(true);
    try {
      for (const file of files) {
        const url = await uploadCarImage(file);
        set('images', [...(form.images || []), url]);
      }
      toast.success('Image(s) uploaded');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    }
    setUploadingImage(false);
  };

  const removeImage = (idx) => set('images', (form.images || []).filter((_, i) => i !== idx));

  const addTag = (field, val, setVal) => {
    if (!val.trim()) return;
    set(field, [...(form[field] || []), val.trim()]);
    setVal('');
  };
  const removeTag = (field, idx) => set(field, (form[field] || []).filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Clean numeric fields
    const data = { ...form };
    ['year', 'mileage', 'horsepower', 'price', 'previous_owners',
     'down_payment', 'down_payment_percentage', 'monthly_payment',
     'loan_term_months', 'interest_rate'].forEach(k => {
      if (data[k] !== '' && data[k] != null) data[k] = Number(data[k]);
      else delete data[k];
    });

    // Remove empty string fields (optional)
    Object.keys(data).forEach(k => {
      if (data[k] === '') delete data[k];
    });

    let error;
    if (isEdit) {
      const { error: updateError } = await supabase
        .from('cars')
        .update(data)
        .eq('id', id);
      error = updateError;
      if (!error) toast.success('Vehicle updated');
    } else {
      const { error: insertError } = await supabase
        .from('cars')
        .insert(data);
      error = insertError;
      if (!error) toast.success('Vehicle created');
    }

    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      navigate('/admin/cars');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center animate-pulse"><div className="h-8 bg-muted rounded w-48 mx-auto" /></div>;

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <button onClick={() => navigate('/admin/cars')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Vehicles
      </button>

      <h1 className="font-playfair text-2xl font-bold mb-6">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Year" required><Input type="number" value={form.year} onChange={e => set('year', e.target.value)} min="1900" max="2030" /></FormField>
            <FormField label="Make" required><Input value={form.make} onChange={e => set('make', e.target.value)} placeholder="Toyota" /></FormField>
            <FormField label="Model" required><Input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Camry" /></FormField>
            <FormField label="Trim"><Input value={form.trim} onChange={e => set('trim', e.target.value)} placeholder="XLE" /></FormField>
            <SelectField label="Body Style" value={form.body_style} onChange={v => set('body_style', v)} options={['Sedan','SUV','Hatchback','Pickup','Van','Coupe','Convertible','Wagon','Crossover','Other']} />
            <FormField label="VIN"><Input value={form.vin} onChange={e => set('vin', e.target.value)} placeholder="1HGBH41JXMN109186" /></FormField>
          </div>
        </Section>

        {/* Condition */}
        <Section title="Condition & Status">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField label="Condition" value={form.condition} onChange={v => set('condition', v)} options={['New','Used','Certified Pre-Owned']} required />
            <FormField label="Mileage"><Input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="45000" /></FormField>
            <SelectField label="Mileage Unit" value={form.mileage_unit} onChange={v => set('mileage_unit', v)} options={['miles','km']} />
            <SelectField label="Title Status" value={form.title_status} onChange={v => set('title_status', v)} options={['Clean','Salvage','Rebuilt','Lien','Missing','Other']} />
            <FormField label="Previous Owners"><Input type="number" value={form.previous_owners} onChange={e => set('previous_owners', e.target.value)} placeholder="1" min="0" /></FormField>
            <SelectField label="Listing Status" value={form.status} onChange={v => set('status', v)} options={['Available','Sold','Reserved','Hidden']} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FormField label="Accident History"><Input value={form.accident_history} onChange={e => set('accident_history', e.target.value)} placeholder="None / describe accidents" /></FormField>
            <FormField label="Service History"><Input value={form.service_history} onChange={e => set('service_history', e.target.value)} placeholder="Full dealer service history" /></FormField>
          </div>
        </Section>

        {/* Technical */}
        <Section title="Technical Specifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Engine Size"><Input value={form.engine_size} onChange={e => set('engine_size', e.target.value)} placeholder="2.0L" /></FormField>
            <SelectField label="Fuel Type" value={form.fuel_type} onChange={v => set('fuel_type', v)} options={['Petrol','Diesel','Hybrid','Electric','Plug-in Hybrid','Other']} required />
            <SelectField label="Transmission" value={form.transmission} onChange={v => set('transmission', v)} options={['Automatic','Manual','CVT','Semi-Automatic']} required />
            <SelectField label="Drivetrain" value={form.drivetrain} onChange={v => set('drivetrain', v)} options={['FWD','RWD','AWD','4x4','4WD']} />
            <FormField label="Horsepower"><Input type="number" value={form.horsepower} onChange={e => set('horsepower', e.target.value)} placeholder="200" /></FormField>
            <FormField label="Fuel (City)"><Input value={form.fuel_consumption_city} onChange={e => set('fuel_consumption_city', e.target.value)} placeholder="12L/100km" /></FormField>
            <FormField label="Fuel (Highway)"><Input value={form.fuel_consumption_highway} onChange={e => set('fuel_consumption_highway', e.target.value)} placeholder="9L/100km" /></FormField>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Exterior Color"><Input value={form.exterior_color} onChange={e => set('exterior_color', e.target.value)} placeholder="Midnight Black" /></FormField>
            <FormField label="Interior Color"><Input value={form.interior_color} onChange={e => set('interior_color', e.target.value)} placeholder="Beige" /></FormField>
            <SelectField label="Interior Material" value={form.interior_material} onChange={v => set('interior_material', v)} options={['Leather','Fabric','Synthetic Leather','Alcantara','Other']} />
          </div>
        </Section>

        {/* Features */}
        <Section title="Features">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TagField label="Key Features" tags={form.key_features || []} newVal={newFeature} setNewVal={setNewFeature}
              onAdd={() => addTag('key_features', newFeature, setNewFeature)} onRemove={i => removeTag('key_features', i)}
              placeholder="e.g. Sunroof" />
            <TagField label="Safety Features" tags={form.safety_features || []} newVal={newSafety} setNewVal={setNewSafety}
              onAdd={() => addTag('safety_features', newSafety, setNewSafety)} onRemove={i => removeTag('safety_features', i)}
              placeholder="e.g. ABS, Airbags" />
          </div>
          <div className="mt-4">
            <FormField label="Modifications / Upgrades">
              <Input value={form.modifications} onChange={e => set('modifications', e.target.value)} placeholder="Aftermarket exhaust, tinted windows..." />
            </FormField>
          </div>
        </Section>

        {/* Commercial */}
        <Section title="Pricing & Listing Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Asking Price ($)" required><Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="29999" /></FormField>
            <FormField label="Location"><Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Los Angeles, CA" /></FormField>
            <FormField label="Stock Number"><Input value={form.stock_number} onChange={e => set('stock_number', e.target.value)} placeholder="STK-001" /></FormField>
            <FormField label="Contact Phone"><Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+1 555 000 0000" /></FormField>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={form.featured} onCheckedChange={v => set('featured', v)} />
              <span>Featured listing</span>
            </label>
          </div>
          <div className="mt-4">
            <FormField label="Description (500–2000 chars)">
              <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the vehicle's key selling points, condition notes, and history..."
                rows={5} maxLength={2000} />
              <p className="text-xs text-muted-foreground mt-1">{(form.description || '').length}/2000</p>
            </FormField>
          </div>
        </Section>

        {/* Financing */}
        <Section title="Financing">
          <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
            <Switch checked={form.has_financing} onCheckedChange={v => set('has_financing', v)} />
            <span>Financing available for this vehicle</span>
          </label>
          {form.has_financing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Down Payment ($)"><Input type="number" value={form.down_payment} onChange={e => set('down_payment', e.target.value)} placeholder="3000" /></FormField>
              <FormField label="Down Payment (%)"><Input type="number" value={form.down_payment_percentage} onChange={e => set('down_payment_percentage', e.target.value)} placeholder="10" min="0" max="100" /></FormField>
              <FormField label="Monthly Payment ($)"><Input type="number" value={form.monthly_payment} onChange={e => set('monthly_payment', e.target.value)} placeholder="450" /></FormField>
              <FormField label="Loan Term (months)"><Input type="number" value={form.loan_term_months} onChange={e => set('loan_term_months', e.target.value)} placeholder="60" /></FormField>
              <FormField label="Interest Rate (%)"><Input type="number" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)} placeholder="4.5" step="0.1" /></FormField>
              <FormField label="Financing Notes"><Input value={form.financing_notes} onChange={e => set('financing_notes', e.target.value)} placeholder="Bank-financed, in-house finance..." /></FormField>
            </div>
          )}
        </Section>

        {/* Images */}
        <Section title="Images (up to 20)">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {(form.images || []).map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">Main</span>}
              </div>
            ))}
            {(form.images || []).length < 20 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-xs">{uploadingImage ? 'Uploading...' : 'Add'}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{(form.images || []).length}/20 images. First image is used as the main thumbnail.</p>
        </Section>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="px-8">
            {saving ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
      <h2 className="font-semibold text-base mb-4 pb-3 border-b border-border">{title}</h2>
      {children}
    </div>
  );
}

function TagField({ label, tags, newVal, setNewVal, onAdd, onRemove, placeholder }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-border rounded-lg bg-background">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => onRemove(i)}><X className="w-2.5 h-2.5" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())} className="h-8 text-sm" />
        <Button type="button" size="sm" variant="outline" onClick={onAdd} className="h-8 px-3"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}
