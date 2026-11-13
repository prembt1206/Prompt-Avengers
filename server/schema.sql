-- ====================================================================
-- RouteLess: The Last Mile — Production PostgreSQL + PostGIS Schema
-- Rural Student Transport Resilience & Recovery Allocation Platform
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'COORDINATOR', 'ADMINISTRATOR');
    CREATE TYPE connectivity_enum AS ENUM ('All-Weather', 'Fair-Weather', 'Vulnerable River Crossing');
    CREATE TYPE school_type_enum AS ENUM ('Higher Secondary School', 'Polytechnic & Vocational ITI');
    CREATE TYPE road_type_enum AS ENUM ('Paved Highway', 'All-Weather Tar', 'Gravel Corridor', 'Low-Lying Causeway');
    CREATE TYPE vehicle_type_enum AS ENUM ('Mini-Bus', 'Maxi-Cab Van', 'Rural Cruiser');
    CREATE TYPE vehicle_status_enum AS ENUM ('Available', 'Assigned', 'On Route', 'Delayed', 'Breakdown', 'Out of Service');
    CREATE TYPE priority_enum AS ENUM ('CRITICAL_EXAM', 'LAB_PRACTICAL', 'REGULAR_ATTENDANCE');
    CREATE TYPE req_status_enum AS ENUM ('Pending', 'Approved', 'Assigned', 'On Route', 'Delayed', 'Cancelled', 'Unassigned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE ENTITIES
CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    panchayat VARCHAR(255) NOT NULL,
    connectivity_type connectivity_enum NOT NULL DEFAULT 'All-Weather',
    description TEXT,
    coordinates_x INT,
    coordinates_y INT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    type school_type_enum NOT NULL,
    school_start_time VARCHAR(10) NOT NULL, -- e.g. "08:30"
    address TEXT NOT NULL,
    coordinates_x INT,
    coordinates_y INT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_connections (
    id VARCHAR(64) PRIMARY KEY,
    from_id VARCHAR(64) NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    to_id VARCHAR(64) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    to_name VARCHAR(255) NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    travel_minutes INT NOT NULL,
    road_type road_type_enum NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason TEXT,
    geom GEOMETRY(LineString, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_trips (
    id VARCHAR(64) PRIMARY KEY,
    vehicle_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(32) NOT NULL UNIQUE,
    vehicle_type vehicle_type_enum NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(32),
    capacity INT NOT NULL CHECK (capacity > 0),
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancel_reason TEXT,
    destination_institution_id VARCHAR(64) NOT NULL REFERENCES institutions(id),
    destination_name VARCHAR(255) NOT NULL,
    departure_time VARCHAR(10) NOT NULL,
    final_arrival_time VARCHAR(10) NOT NULL,
    status vehicle_status_enum NOT NULL DEFAULT 'Available',
    speed_kmh INT NOT NULL DEFAULT 38,
    simulated_progress NUMERIC(3,2) DEFAULT 0.15,
    path_connection_ids TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id VARCHAR(64) NOT NULL REFERENCES vehicle_trips(id) ON DELETE CASCADE,
    village_id VARCHAR(64) NOT NULL REFERENCES villages(id),
    village_name VARCHAR(255) NOT NULL,
    arrival_time VARCHAR(10) NOT NULL,
    departure_time VARCHAR(10) NOT NULL,
    stop_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(32),
    village_id VARCHAR(64) REFERENCES villages(id),
    destination_institution_id VARCHAR(64) REFERENCES institutions(id),
    grade VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_requests (
    id VARCHAR(64) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    grade_or_stream VARCHAR(128) NOT NULL,
    origin_village_id VARCHAR(64) NOT NULL REFERENCES villages(id),
    origin_village_name VARCHAR(255) NOT NULL,
    destination_institution_id VARCHAR(64) NOT NULL REFERENCES institutions(id),
    destination_name VARCHAR(255) NOT NULL,
    required_arrival_time VARCHAR(10) NOT NULL,
    priority_category priority_enum NOT NULL,
    travel_date DATE NOT NULL DEFAULT CURRENT_DATE,
    travel_type VARCHAR(64) NOT NULL DEFAULT 'Examination travel',
    status req_status_enum NOT NULL DEFAULT 'Pending',
    notes TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    submission_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode VARCHAR(16) NOT NULL, -- 'BASELINE' or 'RECOVERY'
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_requests INT NOT NULL,
    assigned_count INT NOT NULL,
    unmet_count INT NOT NULL,
    total_capacity INT NOT NULL,
    allocated_capacity INT NOT NULL,
    capacity_utilization_pct INT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES allocations(id) ON DELETE CASCADE,
    request_id VARCHAR(64) NOT NULL REFERENCES student_requests(id),
    student_name VARCHAR(255) NOT NULL,
    grade_or_stream VARCHAR(128) NOT NULL,
    trip_id VARCHAR(64) NOT NULL REFERENCES vehicle_trips(id),
    vehicle_name VARCHAR(255) NOT NULL,
    pickup_village_id VARCHAR(64) NOT NULL REFERENCES villages(id),
    pickup_village_name VARCHAR(255) NOT NULL,
    dropoff_institution_id VARCHAR(64) NOT NULL REFERENCES institutions(id),
    dropoff_institution_name VARCHAR(255) NOT NULL,
    pickup_time VARCHAR(10) NOT NULL,
    dropoff_time VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    priority_category priority_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS unmet_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES allocations(id) ON DELETE CASCADE,
    request_id VARCHAR(64) NOT NULL REFERENCES student_requests(id),
    student_name VARCHAR(255) NOT NULL,
    origin_village_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    primary_reason_code VARCHAR(64) NOT NULL,
    honest_explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS system_notifications (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    target_role VARCHAR(32) DEFAULT 'ALL',
    target_student_name VARCHAR(255),
    target_student_id VARCHAR(64),
    target_trip_id VARCHAR(64),
    severity VARCHAR(16) NOT NULL DEFAULT 'info',
    suggested_action TEXT
);

-- 4. SPATIAL & PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_institutions_geom ON institutions USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_connections_geom ON transport_connections USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_requests_origin ON student_requests(origin_village_id);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON student_requests(priority_category);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
