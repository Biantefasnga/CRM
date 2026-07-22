import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState({
    users: [],
    clients: [],
    deals: [],
    quotations: [],
    samples: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch from Supabase
      const [
        { data: users },
        { data: clients },
        { data: deals },
        { data: quotations },
        { data: samples },
        { data: activities }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('clients').select('*, contacts(*)'),
        supabase.from('deals').select('*'),
        supabase.from('quotations').select('*, quotation_items(*)'),
        supabase.from('samples').select('*, tat_tracking(*)'),
        supabase.from('activities').select('*')
      ]);

      // 2. Map to the shape expected by App.tsx
      const mappedUsers = (users || []).map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email
      }));

      const mappedClients = (clients || []).map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry_sector,
        testCategories: c.test_categories || [],
        standards: c.standards_required || [],
        status: c.status,
        owner: c.owner_id,
        dealValue: Number(c.total_deal_value) || 0,
        lastContact: c.last_contact_at ? new Date(c.last_contact_at).toISOString().split('T')[0] : "",
        contacts: (c.contacts || []).map((contact: any) => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position,
          primary: contact.is_primary
        }))
      }));

      const mappedDeals = (deals || []).map(d => ({
        id: d.id,
        clientId: d.client_id,
        client: mappedClients.find(c => c.id === d.client_id)?.name || "Unknown",
        title: d.title,
        value: Number(d.value) || 0,
        stage: d.stage,
        probability: d.probability,
        dueDate: d.due_date,
        owner: d.owner_id,
        quotationId: d.quotation_id
      }));

      const mappedQuotations = (quotations || []).map(q => ({
        id: q.id,
        number: q.quotation_number,
        clientId: q.client_id,
        client: mappedClients.find(c => c.id === q.client_id)?.name || "Unknown",
        status: q.status,
        currency: q.currency,
        subtotal: Number(q.subtotal) || 0,
        taxRate: Number(q.tax_rate) || 0,
        total: Number(q.total) || 0,
        validUntil: q.valid_until,
        sentAt: q.sent_at,
        approvedAt: q.approved_at,
        items: (q.quotation_items || []).map((i: any) => ({
          test: i.test_name,
          category: i.test_category,
          method: i.standard_method,
          matrix: i.sample_matrix,
          price: Number(i.unit_price) || 0,
          qty: i.quantity,
          tat: i.standard_tat_days
        }))
      }));

      const mappedSamples = (samples || []).map(s => ({
        id: s.id,
        code: s.sample_code,
        clientId: s.client_id,
        client: mappedClients.find(c => c.id === s.client_id)?.name || "Unknown",
        quotationId: s.quotation_id,
        category: s.test_category,
        received: s.received_date,
        target: s.target_completion_date,
        actual: s.actual_completion_date,
        analyst: s.assigned_analyst,
        tests: (s.tat_tracking || []).map((t: any) => ({
          name: t.test_name,
          method: t.standard_method,
          targetDays: t.target_completion ? Math.ceil((new Date(t.target_completion).getTime() - new Date(t.received_at).getTime()) / 86400000) : 0,
          received: t.received_at
        }))
      }));

      const mappedActivities = (activities || []).map(a => ({
        id: a.id,
        type: a.type,
        actor: mappedUsers.find(u => u.id === a.created_by)?.name || "Unknown",
        clientId: a.client_id,
        client: mappedClients.find(c => c.id === a.client_id)?.name || "Unknown",
        note: a.description,
        time: new Date(a.created_at).toLocaleString()
      }));

      setData({
        users: mappedUsers,
        clients: mappedClients,
        deals: mappedDeals,
        quotations: mappedQuotations,
        samples: mappedSamples,
        activities: mappedActivities
      });
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground">Loading CRM Data...</div>;
  }

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
