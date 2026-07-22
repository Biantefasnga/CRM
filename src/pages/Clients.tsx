import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('lab_clients').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setClients(data);
      }
      setLoading(false);
    };
    fetchClients();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Clients</h1>
        <button className="btn btn-primary">
          <Plus size={20} /> Add Client
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients found. Add one to get started.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Contact Person</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{client.name}</td>
                  <td style={{ padding: '1rem' }}>{client.contact_person}</td>
                  <td style={{ padding: '1rem' }}>{client.email}</td>
                  <td style={{ padding: '1rem' }}>{client.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
