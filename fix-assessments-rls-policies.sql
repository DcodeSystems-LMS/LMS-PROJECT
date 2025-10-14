-- Fix RLS policies for assessments table
-- This will allow proper deletion of assessments

-- Drop existing policies
DROP POLICY IF EXISTS "Instructors can delete their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Instructors can update their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Instructors can create assessments" ON public.assessments;

-- Create more specific policies
CREATE POLICY "Users can create assessments" ON public.assessments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Users can update assessments" ON public.assessments
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        (
            -- Allow if user is admin
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
            OR
            -- Allow if user is the instructor of this assessment
            instructor_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assessments" ON public.assessments
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        (
            -- Allow if user is admin
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
            OR
            -- Allow if user is the instructor of this assessment
            instructor_id = auth.uid()
        )
    );

-- Test the policies
SELECT 
    'Current user ID: ' || auth.uid() as user_info,
    'User role: ' || COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'NOT FOUND') as role_info;
