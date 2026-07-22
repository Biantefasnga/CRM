-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lab Clients Table (Renamed to avoid conflict)
CREATE TABLE lab_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Test Orders Table (Pengujian)
CREATE TABLE IF NOT EXISTS test_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES lab_clients(id) ON DELETE CASCADE,
    sample_name VARCHAR(255) NOT NULL,
    received_date TIMESTAMP WITH TIME ZONE NOT NULL,
    target_completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Test Parameters Table (Parameter Pengujian)
CREATE TABLE IF NOT EXISTS test_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES test_orders(id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    result_value VARCHAR(255),
    unit VARCHAR(50),
    reference_range VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE lab_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to lab_clients" ON lab_clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to test_orders" ON test_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to test_parameters" ON test_parameters FOR ALL TO authenticated USING (true);
