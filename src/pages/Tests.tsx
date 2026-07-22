import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

export default function Tests() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      // Fetch test orders along with the associated client
      const { data, error } = await supabase
        .from('test_orders')
        .select(`
          *,
          lab_clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTests(data);
      }
      setLoading(false);
    };
    fetchTests();
  }, []);

  const getStatusBadge = (status: string) => {
    const className = `status-badge status-${status.toLowerCase().replace(' ', '-')}`;
    return <span className={className}>{status}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Laboratory Tests</h1>
        <button className="btn btn-primary">
          <Plus size={20} /> New Test Order
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>
        ) : tests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tests found. Create a new test order.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Sample Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Client</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Received Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Target TAT</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{test.sample_name}</td>
                  <td style={{ padding: '1rem' }}>{test.lab_clients?.name}</td>
                  <td style={{ padding: '1rem' }}>{new Date(test.received_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(test.target_completion_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(test.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
