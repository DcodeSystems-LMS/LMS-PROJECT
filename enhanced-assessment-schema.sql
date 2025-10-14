-- Enhanced Assessment System Schema
-- Supports role-based access, lifecycle management, and advanced features

-- User Roles and Permissions
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Lifecycle States
CREATE TYPE assessment_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE assessment_type AS ENUM ('quiz', 'test', 'assignment', 'project', 'coding_challenge');

-- Enhanced Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type assessment_type NOT NULL DEFAULT 'quiz',
  status assessment_status NOT NULL DEFAULT 'draft',
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timing and Attempts
  time_limit INTEGER DEFAULT 30, -- minutes, 0 = unlimited
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 60, -- percentage
  
  -- Availability
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Security and Integrity
  security_settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Assessment Assignments (which students can access)
CREATE TABLE IF NOT EXISTS assessment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  special_accommodations JSONB DEFAULT '{}', -- for accessibility
  UNIQUE(assessment_id, student_id)
);

-- Enhanced Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  
  -- Question metadata
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  
  -- Accessibility
  alt_text TEXT, -- for images
  audio_transcript TEXT, -- for audio questions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- seconds
  
  -- Results
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'late')),
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  security_flags JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, student_id, attempt_number)
);

-- Student Responses
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Response data
  response_text TEXT,
  response_files JSONB DEFAULT '[]', -- for file uploads
  response_code TEXT, -- for coding challenges
  
  -- Grading
  points_awarded INTEGER DEFAULT 0,
  max_points INTEGER DEFAULT 0,
  is_correct BOOLEAN DEFAULT FALSE,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  
  -- Metadata
  time_spent INTEGER DEFAULT 0, -- seconds on this question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications System
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  -- Delivery
  email_sent BOOLEAN DEFAULT FALSE,
  in_app_read BOOLEAN DEFAULT FALSE,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and Reporting
CREATE TABLE IF NOT EXISTS assessment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Performance metrics
  total_attempts INTEGER DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- total seconds
  
  -- Question-level analytics
  question_analytics JSONB DEFAULT '{}',
  
  -- Timestamps
  first_attempt TIMESTAMP WITH TIME ZONE,
  last_attempt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- Assessment Policies
CREATE POLICY "Mentors can manage their own assessments" ON assessments
  FOR ALL USING (
    mentor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can view assigned assessments" ON assessments
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM assessment_assignments 
      WHERE assessment_id = assessments.id AND student_id = auth.uid()
    )
  );

-- Assignment Policies
CREATE POLICY "Mentors can assign assessments" ON assessment_assignments
  FOR ALL USING (
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_assignments.assessment_id AND mentor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can view their assignments" ON assessment_assignments
  FOR SELECT USING (student_id = auth.uid());

-- Attempt Policies
CREATE POLICY "Students can manage their own attempts" ON assessment_attempts
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view attempts for their assessments" ON assessment_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_attempts.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Response Policies
CREATE POLICY "Students can manage their own responses" ON question_responses
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view responses for their assessments" ON question_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN assessment_attempts aa ON a.id = aa.assessment_id
      WHERE aa.id = question_responses.attempt_id AND a.mentor_id = auth.uid()
    )
  );

-- Notification Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Audit Log Policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Analytics Policies
CREATE POLICY "Users can view their own analytics" ON assessment_analytics
  FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_analytics.assessment_id AND mentor_id = auth.uid()
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION update_assessment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update status based on availability dates
  IF NEW.available_from IS NOT NULL AND NEW.available_from <= NOW() THEN
    NEW.status := 'published';
    NEW.published_at := NOW();
  END IF;
  
  IF NEW.available_until IS NOT NULL AND NEW.available_until < NOW() THEN
    NEW.status := 'closed';
    NEW.closed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessment_status_trigger
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_status();

-- Indexes for Performance
CREATE INDEX idx_assessments_mentor_status ON assessments(mentor_id, status);
CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assignments_student ON assessment_assignments(student_id);
CREATE INDEX idx_attempts_assessment_student ON assessment_attempts(assessment_id, student_id);
CREATE INDEX idx_responses_attempt ON question_responses(attempt_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_analytics_assessment ON assessment_analytics(assessment_id);

-- Full-text search indexes
CREATE INDEX idx_assessments_search ON assessments USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_questions_search ON questions USING gin(to_tsvector('english', question_text));
