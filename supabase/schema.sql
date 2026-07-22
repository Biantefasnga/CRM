-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry_sector text,
  test_categories text[], -- e.g. {'Water Quality','Materials'}
  standards_required text[], -- e.g. {'ISO 17025','EPA 200.7'}
  status text check (status in ('Active','Prospect','At Risk','Churned')) default 'Prospect',
  owner_id uuid references auth.users(id),
  total_deal_value numeric default 0,
  last_contact_at timestamptz,
  created_at timestamptz default now()
);

-- Contacts
create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  position text,
  is_primary boolean default false
);

-- Pipeline deals
create table deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  title text,
  value numeric,
  stage text check (stage in ('Prospect','Qualified','Quotation Sent','Negotiation','Closed Won','Closed Lost')) default 'Prospect',
  probability int check (probability between 0 and 100) default 20,
  due_date date,
  owner_id uuid references auth.users(id),
  quotation_id uuid, -- will reference quotations
  created_at timestamptz default now()
);

-- Quotations
create table quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text unique not null,
  client_id uuid references clients(id),
  deal_id uuid references deals(id),
  status text check (status in ('Draft','Sent','Under Review','Approved','Rejected','Expired')) default 'Draft',
  currency text default 'IDR',
  subtotal numeric default 0,
  tax_rate numeric default 11, -- e.g. Indonesian VAT
  total numeric default 0,
  valid_until date,
  sent_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now()
);

alter table deals add constraint fk_deals_quotation foreign key (quotation_id) references quotations(id);

-- Quotation line items
create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references quotations(id) on delete cascade,
  test_name text not null,
  test_category text, 
  standard_method text, 
  sample_matrix text, 
  unit_price numeric,
  quantity int default 1,
  standard_tat_days int, 
  line_total numeric generated always as (unit_price * quantity) stored
);

-- Samples received 
create table samples (
  id uuid primary key default gen_random_uuid(),
  sample_code text unique not null,
  client_id uuid references clients(id),
  quotation_id uuid references quotations(id),
  test_category text,
  received_date date default current_date,
  target_completion_date date,
  actual_completion_date date,
  status text check (status in ('Received','In Progress','On Track','At Risk','Overdue','Completed')) default 'Received',
  assigned_analyst uuid references auth.users(id)
);

-- TAT tracking log 
create table tat_tracking (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid references samples(id) on delete cascade,
  test_name text,
  standard_method text,
  received_at timestamptz,
  target_completion timestamptz,
  actual_completion timestamptz,
  status text check (status in ('On Track','At Risk','Overdue','Completed')) default 'On Track',
  notes text
);

-- Activity feed
create table activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  type text check (type in ('Call','Email','Meeting','Note','Quotation','TAT Update')),
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Users/team (Custom user profile table to complement auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id),
  name text,
  email text unique,
  role text check (role in ('Admin','Sales','Lab Analyst','Viewer'))
);

-- For immediate UI development and testing, enable RLS but add an open policy
-- (In a real app, you would replace these with proper user-based policies)
alter table clients enable row level security;
create policy "Allow all" on clients for all using (true);

alter table contacts enable row level security;
create policy "Allow all" on contacts for all using (true);

alter table deals enable row level security;
create policy "Allow all" on deals for all using (true);

alter table quotations enable row level security;
create policy "Allow all" on quotations for all using (true);

alter table quotation_items enable row level security;
create policy "Allow all" on quotation_items for all using (true);

alter table samples enable row level security;
create policy "Allow all" on samples for all using (true);

alter table tat_tracking enable row level security;
create policy "Allow all" on tat_tracking for all using (true);

alter table activities enable row level security;
create policy "Allow all" on activities for all using (true);

alter table user_profiles enable row level security;
create policy "Allow all" on user_profiles for all using (true);
