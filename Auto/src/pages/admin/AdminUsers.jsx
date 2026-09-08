import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    // Fetch all profiles with their roles and basic info
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) toast.error('Update failed: ' + error.message);
    else {
      toast.success('User role updated');
      load();
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><p className="font-semibold">No users found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{user.full_name || 'No name'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' && <Shield className="w-2.5 h-2.5 inline mr-0.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Select value={user.role || 'user'} onValueChange={v => updateRole(user.id, v)}>
                        <SelectTrigger className="h-8 text-xs w-28 ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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
