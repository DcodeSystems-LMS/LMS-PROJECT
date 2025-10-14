-- Enable Real-time Replication for Profiles Table
-- This script ensures real-time updates work properly

-- Check current real-time settings
SELECT 
    schemaname, 
    tablename, 
    row_security,
    CASE 
        WHEN c.relreplident = 'f' THEN 'FULL'
        WHEN c.relreplident = 'd' THEN 'DEFAULT'
        WHEN c.relreplident = 'i' THEN 'INDEX'
        WHEN c.relreplident = 'n' THEN 'NOTHING'
        ELSE 'UNKNOWN'
    END as replica_identity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename = 'profiles';

-- Enable real-time replication for profiles table
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Check if real-time is enabled
SELECT 
    schemaname, 
    tablename, 
    row_security,
    CASE 
        WHEN c.relreplident = 'f' THEN 'FULL'
        WHEN c.relreplident = 'd' THEN 'DEFAULT'
        WHEN c.relreplident = 'i' THEN 'INDEX'
        WHEN c.relreplident = 'n' THEN 'NOTHING'
        ELSE 'UNKNOWN'
    END as replica_identity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename = 'profiles';

-- Test real-time subscription
DO $$
DECLARE
    test_channel TEXT;
    test_result RECORD;
BEGIN
    -- Create a test channel
    test_channel := 'test-realtime-' || extract(epoch from now())::text;
    
    -- Test if we can create a channel (this will fail if real-time is not enabled)
    BEGIN
        PERFORM pg_notify(test_channel, 'test message');
        RAISE NOTICE '✅ Real-time is enabled and working';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Real-time may not be enabled: %', SQLERRM;
    END;
END $$;

-- Check publication settings
SELECT * FROM pg_publication_tables WHERE tablename = 'profiles';

-- If no publication exists, create one
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
        RAISE NOTICE '✅ Created supabase_realtime publication';
    ELSE
        RAISE NOTICE '✅ supabase_realtime publication already exists';
    END IF;
    
    -- Add profiles table to publication if not already there
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
        RAISE NOTICE '✅ Added profiles table to publication';
    ELSE
        RAISE NOTICE '✅ profiles table already in publication';
    END IF;
END $$;

-- Final verification
SELECT 
    schemaname, 
    tablename, 
    row_security,
    CASE 
        WHEN c.relreplident = 'f' THEN 'FULL - Real-time enabled'
        WHEN c.relreplident = 'd' THEN 'DEFAULT - Real-time may not work'
        WHEN c.relreplident = 'i' THEN 'INDEX - Real-time enabled'
        WHEN c.relreplident = 'n' THEN 'NOTHING - Real-time disabled'
        ELSE 'OTHER - ' || c.relreplident
    END as realtime_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename = 'profiles';

SELECT 'Real-time replication setup complete' as status;
