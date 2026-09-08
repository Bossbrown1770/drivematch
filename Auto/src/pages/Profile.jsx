import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Save, Mail, Phone, MapPin, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', city: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // redirect handled by ProtectedRoute, but we can navigate if needed
      return;
    }
    // Fetch profile data from profiles table (if not already in context)
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, address, city')
        .eq('id', user.id)
        .single();
      if (data) {
        setForm({ phone: data.phone || '', address: data.address || '', city: data.city || '' });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone: form.phone, address: form.address, city: form.city })
      .eq('id', user.id);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-6" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold">{user?.user_metadata?.full_name || 'My Profile'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-1">Account Information</h2>
        <p className="text-sm text-muted-foreground mb-5">Update your contact details below.</p>

        {/* Read-only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><User className="w-3 h-3" /> Full Name</Label>
            <Input value={user?.user_metadata?.full_name || ''} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Managed by your account</p>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Managed by your account</p>
          </div>
        </div>

        <Separator className="mb-5" />

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> Phone Number</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building className="w-3 h-3" /> City</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="New York" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> Address</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main Street" />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
