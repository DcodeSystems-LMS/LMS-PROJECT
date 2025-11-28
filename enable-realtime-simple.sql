-- Simple Real-time Replication Setup
-- This script enables real-time updates for the profiles table

-- Step 1: Enable real-time replication for profiles table
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Step 2: Check if real-time is enabled
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN c.relreplident = 'f' THEN '✅ FULL - Real-time enabled'
        WHEN c.relreplident = 'd' THEN '⚠️ DEFAULT - Real-time may not work'
        WHEN c.relreplident = 'i' THEN '✅ INDEX - Real-time enabled'
        WHEN c.relreplident = 'n' THEN '❌ NOTHING - Real-time disabled'
        ELSE '❓ UNKNOWN - ' || c.relreplident::text
    END as realtime_status
FROM pg_class c
WHERE c.relname = 'profiles';

-- Step 3: Ensure publication exists and includes profiles table
DO $$
BEGIN
    -- Create publication if it doesn't exist
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

-- Step 4: Final verification
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN c.relreplident = 'f' THEN '✅ FULL - Real-time enabled'
        WHEN c.relreplident = 'd' THEN '⚠️ DEFAULT - Real-time may not work'
        WHEN c.relreplident = 'i' THEN '✅ INDEX - Real-time enabled'
        WHEN c.relreplident = 'n' THEN '❌ NOTHING - Real-time disabled'
        ELSE '❓ UNKNOWN - ' || c.relreplident::text
    END as realtime_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') 
        THEN '✅ In publication'
        ELSE '❌ Not in publication'
    END as publication_status
FROM pg_class c
WHERE c.relname = 'profiles';

SELECT '🎉 Real-time replication setup complete!' as status;
