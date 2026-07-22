import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, FlaskConical, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTests: 0,
    pendingTests: 0,
    overdueTests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: clientsCount }, { count: testsCount }, { count: pendingCount }, { count: overdueCount }] = await Promise.all([
          supabase.from('lab_clients').select('*', { count: 'exact', head: true }),
          supabase.from('test_orders').select('*', { count: 'exact', head: true }),
          supabase.from('test_orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
          supabase.from('test_orders').select('*', { count: 'exact', head: true }).eq('status', 'Overdue'),
        ]);

        setStats({
          totalClients: clientsCount || 0,
          totalTests: testsCount || 0,
          pendingTests: pendingCount || 0,
          overdueTests: overdueCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: <Users size={24} />, color: 'var(--primary)' },
    { label: 'Total Test Orders', value: stats.totalTests, icon: <FlaskConical size={24} />, color: 'var(--success)' },
    { label: 'Pending Tests', value: stats.pendingTests, icon: <Clock size={24} />, color: 'var(--warning)' },
    { label: 'Overdue Tests', value: stats.overdueTests, icon: <AlertTriangle size={24} />, color: 'var(--danger)' },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        {statCards.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Activity</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome to the CRM Lab application. Navigate to Clients or Lab Tests to start managing your data.</p>
      </div>
    </div>
  );
}
