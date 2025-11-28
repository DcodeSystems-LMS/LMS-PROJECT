-- Advanced Assessment Features Schema
-- Extends the enhanced assessment system with advanced features

-- Assessment Metadata
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS weightage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS bloom_taxonomy_level VARCHAR(20) DEFAULT 'remember';

-- Question Enhancements
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS negative_marking DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS section_id UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS section_name VARCHAR(100);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_order INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS media_files JSONB DEFAULT '[]';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rich_text_content TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_language VARCHAR(50);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_template TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT '[]';

-- Assessment Sections
CREATE TABLE IF NOT EXISTS assessment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  section_type VARCHAR(50) DEFAULT 'mixed',
  time_limit INTEGER, -- minutes for this section
  order_index INTEGER DEFAULT 0,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Assessment Settings
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS advanced_settings JSONB DEFAULT '{}';

-- Assessment Delivery Controls
CREATE TABLE IF NOT EXISTS assessment_delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Retake Policy
  allow_retakes BOOLEAN DEFAULT FALSE,
  retake_after_deadline BOOLEAN DEFAULT FALSE,
  max_retakes INTEGER DEFAULT 0,
  
  -- Grading Mode
  grading_mode VARCHAR(20) DEFAULT 'automatic' CHECK (grading_mode IN ('automatic', 'manual', 'hybrid')),
  partial_grading BOOLEAN DEFAULT TRUE,
  group_assessment BOOLEAN DEFAULT FALSE,
  group_size INTEGER DEFAULT 1,
  
  -- Security Settings
  ip_restrictions TEXT[] DEFAULT '{}',
  browser_restrictions TEXT[] DEFAULT '{}',
  question_pooling BOOLEAN DEFAULT FALSE,
  pool_size INTEGER DEFAULT 0,
  plagiarism_check BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Progress Tracking
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  
  -- Progress Data
  current_question_id UUID REFERENCES questions(id),
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Time Tracking
  time_spent INTEGER DEFAULT 0, -- seconds
  time_remaining INTEGER DEFAULT 0, -- seconds
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Save & Resume
  saved_responses JSONB DEFAULT '{}',
  resume_enabled BOOLEAN DEFAULT TRUE,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Pool Management
CREATE TABLE IF NOT EXISTS question_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  pool_type VARCHAR(50) DEFAULT 'random',
  questions JSONB DEFAULT '[]', -- Array of question IDs
  selection_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced Analytics
CREATE TABLE IF NOT EXISTS question_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Performance Metrics
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
  average_time_spent INTEGER DEFAULT 0,
  
  -- Difficulty Analysis
  difficulty_score DECIMAL(3,2) DEFAULT 0.00,
  discrimination_index DECIMAL(3,2) DEFAULT 0.00,
  
  -- Common Wrong Answers
  common_errors JSONB DEFAULT '[]',
  most_missed_options JSONB DEFAULT '[]',
  
  -- Bloom's Taxonomy Analysis
  bloom_level_performance JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Time Tracking
CREATE TABLE IF NOT EXISTS student_time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  
  time_spent INTEGER DEFAULT 0, -- seconds on this question
  time_started TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_ended TIMESTAMP WITH TIME ZONE,
  
  -- Interaction Data
  keystrokes INTEGER DEFAULT 0,
  mouse_clicks INTEGER DEFAULT 0,
  focus_time INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plagiarism Detection
CREATE TABLE IF NOT EXISTS plagiarism_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  
  -- Plagiarism Data
  similarity_score DECIMAL(5,2) DEFAULT 0.00,
  matched_sources JSONB DEFAULT '[]',
  flagged_content TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.00,
  
  -- Detection Details
  detection_method VARCHAR(50) DEFAULT 'text_similarity',
  detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'confirmed', 'dismissed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Assessments
CREATE TABLE IF NOT EXISTS assessment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  group_name VARCHAR(100) NOT NULL,
  group_code VARCHAR(20) UNIQUE NOT NULL,
  max_members INTEGER DEFAULT 5,
  current_members INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES assessment_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  UNIQUE(group_id, student_id)
);

-- Import/Export Templates
CREATE TABLE IF NOT EXISTS import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'csv', 'json', 'qti'
  template_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboards and Gamification
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Performance Metrics
  score DECIMAL(5,2) DEFAULT 0.00,
  rank INTEGER DEFAULT 0,
  percentile DECIMAL(5,2) DEFAULT 0.00,
  
  -- Gamification
  badges JSONB DEFAULT '[]',
  points INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  
  -- Timestamps
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for new tables
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE plagiarism_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Assessment Sections Policies
CREATE POLICY "Mentors can manage assessment sections" ON assessment_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_sections.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Delivery Settings Policies
CREATE POLICY "Mentors can manage delivery settings" ON assessment_delivery_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_delivery_settings.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Student Progress Policies
CREATE POLICY "Students can manage their own progress" ON student_progress
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view student progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = student_progress.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Question Analytics Policies
CREATE POLICY "Mentors can view question analytics" ON question_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = question_analytics.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Time Tracking Policies
CREATE POLICY "Students can manage their time tracking" ON student_time_tracking
  FOR ALL USING (student_id = auth.uid());

-- Plagiarism Reports Policies
CREATE POLICY "Students can view their plagiarism reports" ON plagiarism_reports
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Mentors can view plagiarism reports for their assessments" ON plagiarism_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = plagiarism_reports.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Group Assessment Policies
CREATE POLICY "Students can manage their groups" ON assessment_groups
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Students can join groups" ON group_members
  FOR INSERT USING (student_id = auth.uid());

-- Leaderboard Policies
CREATE POLICY "Students can view leaderboards" ON leaderboards
  FOR SELECT USING (student_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = leaderboards.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION calculate_question_difficulty(question_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  total_attempts INTEGER;
  correct_attempts INTEGER;
  difficulty_score DECIMAL(3,2);
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct = true)
  INTO total_attempts, correct_attempts
  FROM question_responses
  WHERE question_id = calculate_question_difficulty.question_id;
  
  IF total_attempts = 0 THEN
    RETURN 0.50; -- Default medium difficulty
  END IF;
  
  difficulty_score := 1.0 - (correct_attempts::DECIMAL / total_attempts);
  RETURN LEAST(GREATEST(difficulty_score, 0.0), 1.0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_question_analytics(question_id UUID)
RETURNS VOID AS $$
DECLARE
  analytics_data RECORD;
BEGIN
  SELECT 
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
    AVG(time_spent) as avg_time_spent,
    calculate_question_difficulty(question_id) as difficulty_score
  INTO analytics_data
  FROM question_responses
  WHERE question_id = update_question_analytics.question_id;
  
  INSERT INTO question_analytics (
    question_id,
    assessment_id,
    total_attempts,
    correct_attempts,
    accuracy_percentage,
    average_time_spent,
    difficulty_score
  ) VALUES (
    question_id,
    (SELECT assessment_id FROM questions WHERE id = question_id),
    analytics_data.total_attempts,
    analytics_data.correct_attempts,
    (analytics_data.correct_attempts::DECIMAL / analytics_data.total_attempts * 100),
    analytics_data.avg_time_spent,
    analytics_data.difficulty_score
  )
  ON CONFLICT (question_id) DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    correct_attempts = EXCLUDED.correct_attempts,
    accuracy_percentage = EXCLUDED.accuracy_percentage,
    average_time_spent = EXCLUDED.average_time_spent,
    difficulty_score = EXCLUDED.difficulty_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic analytics updates
CREATE OR REPLACE FUNCTION trigger_update_question_analytics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_question_analytics(NEW.question_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_analytics_trigger
  AFTER INSERT OR UPDATE ON question_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_question_analytics();

-- Indexes for performance
CREATE INDEX idx_assessments_tags ON assessments USING gin(tags);
CREATE INDEX idx_assessments_category ON assessments(category);
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_questions_points ON questions(points);
CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_student_progress_assessment ON student_progress(assessment_id);
CREATE INDEX idx_time_tracking_student ON student_time_tracking(student_id);
CREATE INDEX idx_plagiarism_reports_student ON plagiarism_reports(student_id);
CREATE INDEX idx_leaderboards_assessment ON leaderboards(assessment_id);
CREATE INDEX idx_leaderboards_score ON leaderboards(score DESC);

-- Full-text search for rich content
CREATE INDEX idx_questions_rich_text ON questions USING gin(to_tsvector('english', rich_text_content));
CREATE INDEX idx_questions_media ON questions USING gin(media_files);
