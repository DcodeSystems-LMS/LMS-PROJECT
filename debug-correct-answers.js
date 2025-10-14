// Debug Correct Answers Issue
// This script helps identify why correct answers aren't being saved or compared properly

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCorrectAnswers() {
  try {
    console.log('🔍 Debugging Correct Answers Issue...');
    console.log('=====================================');

    // 1. Check questions table structure
    console.log('\n📊 1. Checking questions table structure:');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'questions')
      .in('column_name', ['correct_answer', 'correct_answers']);

    if (columnsError) {
      console.error('❌ Error fetching table structure:', columnsError);
    } else {
      console.log('✅ Table structure:', columns);
    }

    // 2. Check recent questions and their correct answers
    console.log('\n📝 2. Recent questions with correct answers:');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, question_type, correct_answer, correct_answers, options, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError);
    } else {
      console.log('✅ Recent questions:');
      questions.forEach((q, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log(`  ID: ${q.id}`);
        console.log(`  Text: ${q.question_text}`);
        console.log(`  Type: ${q.question_type}`);
        console.log(`  Correct Answer: "${q.correct_answer}"`);
        console.log(`  Correct Answers: ${JSON.stringify(q.correct_answers)}`);
        console.log(`  Options: ${JSON.stringify(q.options)}`);
        console.log(`  Created: ${q.created_at}`);
      });
    }

    // 3. Check for questions with empty or null correct answers
    console.log('\n⚠️ 3. Questions with missing correct answers:');
    const { data: emptyAnswers, error: emptyError } = await supabase
      .from('questions')
      .select('id, question_text, question_type, correct_answer')
      .or('correct_answer.is.null,correct_answer.eq.');

    if (emptyError) {
      console.error('❌ Error fetching empty answers:', emptyError);
    } else {
      if (emptyAnswers.length > 0) {
        console.log(`❌ Found ${emptyAnswers.length} questions with missing correct answers:`);
        emptyAnswers.forEach((q, index) => {
          console.log(`  ${index + 1}. ${q.question_text} (Type: ${q.question_type})`);
        });
      } else {
        console.log('✅ No questions with missing correct answers found');
      }
    }

    // 4. Check assessment results to see how answers are stored
    console.log('\n📊 4. Recent assessment results:');
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('id, assessment_id, student_id, score, answers, completed_at')
      .order('completed_at', { ascending: false })
      .limit(3);

    if (resultsError) {
      console.error('❌ Error fetching results:', resultsError);
    } else {
      console.log('✅ Recent assessment results:');
      results.forEach((result, index) => {
        console.log(`\nResult ${index + 1}:`);
        console.log(`  ID: ${result.id}`);
        console.log(`  Assessment ID: ${result.assessment_id}`);
        console.log(`  Student ID: ${result.student_id}`);
        console.log(`  Score: ${result.score}%`);
        console.log(`  Answers: ${JSON.stringify(result.answers)}`);
        console.log(`  Completed: ${result.completed_at}`);
      });
    }

    // 5. Test answer comparison logic
    console.log('\n🧪 5. Testing answer comparison logic:');
    if (questions.length > 0 && results.length > 0) {
      const question = questions[0];
      const result = results[0];
      
      console.log(`\nTesting with Question: "${question.question_text}"`);
      console.log(`Correct Answer: "${question.correct_answer}"`);
      console.log(`Question Type: ${question.question_type}`);
      
      if (result.answers && Object.keys(result.answers).length > 0) {
        const questionId = question.id;
        const userAnswer = result.answers[questionId];
        
        if (userAnswer) {
          console.log(`User Answer: "${userAnswer}"`);
          
          // Test different comparison methods
          const exactMatch = userAnswer === question.correct_answer;
          const caseInsensitiveMatch = userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
          const partialMatch = userAnswer.toLowerCase().includes(question.correct_answer.toLowerCase());
          
          console.log(`\nComparison Results:`);
          console.log(`  Exact Match: ${exactMatch}`);
          console.log(`  Case Insensitive Match: ${caseInsensitiveMatch}`);
          console.log(`  Partial Match: ${partialMatch}`);
        } else {
          console.log('❌ No user answer found for this question');
        }
      } else {
        console.log('❌ No user answers found in this result');
      }
    }

    console.log('\n=====================================');
    console.log('🔍 Debug complete! Check the output above for issues.');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug function
debugCorrectAnswers();




