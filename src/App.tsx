import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LayoutDashboard, Users, FlaskConical, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Tests from './pages/Tests';
import Login from './pages/Login';

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/clients', label: 'Clients', icon: <Users size={20} /> },
    { path: '/tests', label: 'Lab Tests', icon: <FlaskConical size={20} /> },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>CRM Lab</h2>
        </div>
        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', color: 'var(--danger)' }}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Router basename="/CRM">
      <Routes>
        <Route path="/login" element={<Login session={session} />} />
        <Route path="/" element={session ? <AppLayout><Dashboard /></AppLayout> : <Login session={session} />} />
        <Route path="/clients" element={session ? <AppLayout><Clients /></AppLayout> : <Login session={session} />} />
        <Route path="/tests" element={session ? <AppLayout><Tests /></AppLayout> : <Login session={session} />} />
      </Routes>
    </Router>
  );
}

export default App;
