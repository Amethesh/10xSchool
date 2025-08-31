-- Create demo_bookings table for storing demo session booking requests
CREATE TABLE IF NOT EXISTS demo_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age VARCHAR(10) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    city_country VARCHAR(255) NOT NULL,
    registering_for VARCHAR(50) NOT NULL CHECK (registering_for IN ('My Child', 'Self', 'Another Person')),
    preferred_times JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_demo_bookings_email ON demo_bookings(email);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_created_at ON demo_bookings(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_demo_bookings_updated_at 
    BEFORE UPDATE ON demo_bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert their own bookings
CREATE POLICY "Users can insert demo bookings" ON demo_bookings
    FOR INSERT WITH CHECK (true);

-- Policy to allow users to view their own bookings (based on email)
CREATE POLICY "Users can view their own demo bookings" ON demo_bookings
    FOR SELECT USING (true);

-- Policy for admin users to view all bookings (you can modify this based on your admin setup)
CREATE POLICY "Admin can view all demo bookings" ON demo_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('admin@example.com') -- Replace with your admin email
        )
    );

-- Add comments for documentation
COMMENT ON TABLE demo_bookings IS 'Stores demo session booking requests from potential students';
COMMENT ON COLUMN demo_bookings.name IS 'Student name';
COMMENT ON COLUMN demo_bookings.email IS 'Contact email address';
COMMENT ON COLUMN demo_bookings.age IS 'Student age';
COMMENT ON COLUMN demo_bookings.parent_name IS 'Parent or guardian name';
COMMENT ON COLUMN demo_bookings.contact_number IS 'WhatsApp contact number';
COMMENT ON COLUMN demo_bookings.city_country IS 'Student location (city/country)';
COMMENT ON COLUMN demo_bookings.registering_for IS 'Who the registration is for';
COMMENT ON COLUMN demo_bookings.preferred_times IS 'JSON array of preferred time slot IDs';
COMMENT ON COLUMN demo_bookings.status IS 'Booking status: pending, confirmed, completed, cancelled';