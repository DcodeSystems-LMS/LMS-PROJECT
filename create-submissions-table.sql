-- Create submissions table for code playground
-- This table stores user code submissions and execution results

CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    output TEXT,
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_language ON submissions(language);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own submissions
CREATE POLICY "Users can delete own submissions" ON submissions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON submissions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
