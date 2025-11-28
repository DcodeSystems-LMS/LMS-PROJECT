// Test script to verify if explanation field is being saved properly
// This script tests the question creation with explanation field

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testExplanationSaving() {
  try {
    console.log('🧪 Testing explanation field saving...');

    // First, let's check if we can find an existing assessment
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title')
      .limit(1);

    if (assessmentError) {
      console.error('❌ Error fetching assessments:', assessmentError);
      return;
    }

    if (!assessments || assessments.length === 0) {
      console.error('❌ No assessments found');
      return;
    }

    const assessment = assessments[0];
    console.log('✅ Found assessment:', assessment.title, 'ID:', assessment.id);

    // Test question data with explanation
    const testQuestion = {
      assessment_id: assessment.id,
      question_text: 'Test question with explanation',
      question_type: 'multiple-choice',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: '0',
      explanation: 'This is a test explanation that should be saved to the database.',
      points: 2,
      order_index: 1,
      difficulty_level: 'easy',
      tags: ['test', 'explanation']
    };

    console.log('📝 Test question data:', testQuestion);

    // Insert the test question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert(testQuestion)
      .select()
      .single();

    if (questionError) {
      console.error('❌ Error creating question:', questionError);
      console.error('Error details:', questionError);
      return;
    }

    console.log('✅ Question created successfully!');
    console.log('📊 Question data:', questionData);

    // Verify the explanation was saved
    if (questionData.explanation === testQuestion.explanation) {
      console.log('✅ Explanation field saved correctly!');
      console.log('📝 Saved explanation:', questionData.explanation);
    } else {
      console.error('❌ Explanation field not saved correctly!');
      console.log('Expected:', testQuestion.explanation);
      console.log('Actual:', questionData.explanation);
    }

    // Clean up - delete the test question
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionData.id);

    if (deleteError) {
      console.error('⚠️ Error deleting test question:', deleteError);
    } else {
      console.log('🧹 Test question cleaned up successfully');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testExplanationSaving();




