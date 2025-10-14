// Enhanced DataService Methods for Comprehensive Assessment System
// Add these methods to your DataService class

// 1. Create Question with Enhanced Support
static async createQuestion(questionData) {
  try {
    console.log('🔍 Creating enhanced question:', questionData);
    
    // Process question data based on type
    const processedData = {
      ...questionData,
      // Convert arrays to JSON strings for database storage
      options: questionData.options ? JSON.stringify(questionData.options) : null,
      correct_answers: questionData.correct_answers ? JSON.stringify(questionData.correct_answers) : null,
      evaluation_criteria: questionData.evaluation_criteria ? JSON.stringify(questionData.evaluation_criteria) : null,
      test_cases: questionData.test_cases ? JSON.stringify(questionData.test_cases) : null,
      blank_positions: questionData.blank_positions ? JSON.stringify(questionData.blank_positions) : null,
      media_files: questionData.media_files ? JSON.stringify(questionData.media_files) : null,
      
      // Set auto_grade based on question type
      auto_grade: this.isAutoGradable(questionData.question_type),
      
      // Default values
      points: questionData.points || 1,
      order_index: questionData.order_index || 1,
      difficulty_level: questionData.difficulty_level || 'medium',
      tags: questionData.tags || []
    };
    
    console.log('🔍 Processed question data:', processedData);
    
    const { data, error } = await supabase
      .from('questions')
      .insert(processedData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating question:', error);
      return { data: null, error };
    }
    
    console.log('✅ Question created successfully:', data);
    return { data, error: null };
  } catch (err) {
    console.error('❌ Error in createQuestion:', err);
    return { data: null, error: err };
  }
}

// 2. Determine if question is auto-gradable
static isAutoGradable(questionType) {
  const autoGradableTypes = [
    'multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'fill-in-blanks'
  ];
  return autoGradableTypes.includes(questionType);
}

// 3. Submit Student Response
static async submitStudentResponse(attemptId, questionId, studentId, responseData) {
  try {
    console.log('🔍 Submitting student response:', { attemptId, questionId, studentId, responseData });
    
    const { data, error } = await supabase.rpc('submit_student_response', {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_student_id: studentId,
      p_answer_text: responseData.answer_text || null,
      p_answer_json: responseData.answer_json || null,
      p_file_uploads: responseData.file_uploads || null,
      p_code_submission: responseData.code_submission || null
    });
    
    if (error) {
      console.error('❌ Error submitting response:', error);
      return { data: null, error };
    }
    
    console.log('✅ Student response submitted:', data);
    return { data, error: null };
  } catch (err) {
    console.error('❌ Error in submitStudentResponse:', err);
    return { data: null, error: err };
  }
}

// 4. Auto-grade Objective Questions
static async autoGradeResponse(responseId, questionData, studentAnswer) {
  try {
    console.log('🔍 Auto-grading response:', { responseId, questionType: questionData.question_type });
    
    let score = 0;
    let isCorrect = false;
    
    switch (questionData.question_type) {
      case 'multiple-choice':
        isCorrect = this.gradeMultipleChoice(questionData, studentAnswer);
        break;
      case 'multiple-select':
        isCorrect = this.gradeMultipleSelect(questionData, studentAnswer);
        break;
      case 'true-false':
        isCorrect = this.gradeTrueFalse(questionData, studentAnswer);
        break;
      case 'short-answer':
        isCorrect = this.gradeShortAnswer(questionData, studentAnswer);
        break;
      case 'fill-in-blanks':
        isCorrect = this.gradeFillInBlanks(questionData, studentAnswer);
        break;
      default:
        console.warn('⚠️ Unknown question type for auto-grading:', questionData.question_type);
        return { score: 0, isCorrect: false };
    }
    
    score = isCorrect ? questionData.points : 0;
    
    // Update response with score
    const { error } = await supabase
      .from('student_responses')
      .update({
        auto_score: score,
        final_score: score,
        status: 'auto-graded'
      })
      .eq('id', responseId);
    
    if (error) {
      console.error('❌ Error updating response score:', error);
      return { score: 0, isCorrect: false, error };
    }
    
    console.log('✅ Auto-grading completed:', { score, isCorrect });
    return { score, isCorrect, error: null };
  } catch (err) {
    console.error('❌ Error in autoGradeResponse:', err);
    return { score: 0, isCorrect: false, error: err };
  }
}

// 5. Grade Multiple Choice
static gradeMultipleChoice(questionData, studentAnswer) {
  const correctIndex = parseInt(questionData.correct_answer);
  const options = JSON.parse(questionData.options || '[]');
  const correctText = options[correctIndex];
  
  return studentAnswer === correctText;
}

// 6. Grade Multiple Select
static gradeMultipleSelect(questionData, studentAnswer) {
  const correctIndices = JSON.parse(questionData.correct_answers || '[]');
  const options = JSON.parse(questionData.options || '[]');
  const correctAnswers = correctIndices.map(index => options[parseInt(index)]);
  
  const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
  
  // Check if all correct answers are selected and no incorrect ones
  const allCorrectSelected = correctAnswers.every(correct => studentAnswers.includes(correct));
  const noIncorrectSelected = studentAnswers.every(student => correctAnswers.includes(student));
  
  return allCorrectSelected && noIncorrectSelected;
}

// 7. Grade True/False
static gradeTrueFalse(questionData, studentAnswer) {
  const correctAnswer = questionData.correct_answer;
  return studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
}

// 8. Grade Short Answer
static gradeShortAnswer(questionData, studentAnswer) {
  const correctAnswer = questionData.correct_answer.toLowerCase();
  const studentAnswerLower = studentAnswer.toLowerCase();
  
  // Check for exact match
  if (studentAnswerLower === correctAnswer) {
    return true;
  }
  
  // Check for partial match (contains key words)
  const correctWords = correctAnswer.split(/\s+/);
  const studentWords = studentAnswerLower.split(/\s+/);
  const matchingWords = correctWords.filter(word => studentWords.includes(word));
  
  // Consider correct if at least 70% of words match
  const matchRatio = matchingWords.length / correctWords.length;
  return matchRatio >= 0.7;
}

// 9. Grade Fill in the Blanks
static gradeFillInBlanks(questionData, studentAnswer) {
  const blankPositions = JSON.parse(questionData.blank_positions || '[]');
  const correctAnswers = JSON.parse(questionData.correct_answers || '[]');
  
  let correctBlanks = 0;
  blankPositions.forEach((blank, index) => {
    const studentBlankAnswer = studentAnswer[`${questionData.id}_${index}`];
    const correctBlankAnswer = correctAnswers[index];
    
    if (studentBlankAnswer && correctBlankAnswer) {
      if (studentBlankAnswer.toLowerCase().trim() === correctBlankAnswer.toLowerCase().trim()) {
        correctBlanks++;
      }
    }
  });
  
  // Consider correct if at least 80% of blanks are correct
  const blankRatio = correctBlanks / blankPositions.length;
  return blankRatio >= 0.8;
}

// 10. Get Grading Queue for Instructor
static async getGradingQueue(instructorId) {
  try {
    console.log('🔍 Fetching grading queue for instructor:', instructorId);
    
    const { data, error } = await supabase
      .from('grading_queue')
      .select(`
        *,
        attempt:assessment_attempts(*),
        question:questions(*),
        student:profiles!student_id(*),
        response:student_responses(*)
      `)
      .eq('instructor_id', instructorId)
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('assigned_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching grading queue:', error);
      return { data: [], error };
    }
    
    console.log('✅ Grading queue fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('❌ Error in getGradingQueue:', err);
    return { data: [], error: err };
  }
}

// 11. Grade Subjective Question
static async gradeSubjectiveQuestion(responseId, score, feedback, gradedBy) {
  try {
    console.log('🔍 Grading subjective question:', { responseId, score, feedback });
    
    const { error } = await supabase
      .from('student_responses')
      .update({
        manual_score: score,
        final_score: score,
        feedback: feedback,
        graded_by: gradedBy,
        graded_at: new Date().toISOString(),
        status: 'manually-graded'
      })
      .eq('id', responseId);
    
    if (error) {
      console.error('❌ Error grading subjective question:', error);
      return { error };
    }
    
    console.log('✅ Subjective question graded successfully');
    return { error: null };
  } catch (err) {
    console.error('❌ Error in gradeSubjectiveQuestion:', err);
    return { error: err };
  }
}

// 12. Calculate Final Assessment Score
static async calculateFinalScore(attemptId) {
  try {
    console.log('🔍 Calculating final score for attempt:', attemptId);
    
    const { data, error } = await supabase.rpc('calculate_final_score', {
      p_attempt_id: attemptId
    });
    
    if (error) {
      console.error('❌ Error calculating final score:', error);
      return { score: 0, error };
    }
    
    console.log('✅ Final score calculated:', data);
    return { score: data, error: null };
  } catch (err) {
    console.error('❌ Error in calculateFinalScore:', err);
    return { score: 0, error: err };
  }
}

// 13. Get Assessment Results for Student
static async getAssessmentResults(studentId, assessmentId) {
  try {
    console.log('🔍 Fetching assessment results:', { studentId, assessmentId });
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select(`
        *,
        assessment:assessments(*),
        attempt:assessment_attempts(*)
      `)
      .eq('student_id', studentId)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching assessment results:', error);
      return { data: [], error };
    }
    
    console.log('✅ Assessment results fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('❌ Error in getAssessmentResults:', err);
    return { data: [], error: err };
  }
}

// 14. Get Student Responses for Review
static async getStudentResponses(attemptId) {
  try {
    console.log('🔍 Fetching student responses for attempt:', attemptId);
    
    const { data, error } = await supabase
      .from('student_responses')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching student responses:', error);
      return { data: [], error };
    }
    
    console.log('✅ Student responses fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('❌ Error in getStudentResponses:', err);
    return { data: [], error: err };
  }
}

// 15. Publish Assessment Results
static async publishAssessmentResults(attemptId, showCorrectAnswers = true, showExplanations = true) {
  try {
    console.log('🔍 Publishing assessment results:', { attemptId, showCorrectAnswers, showExplanations });
    
    // Get attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();
    
    if (attemptError) {
      console.error('❌ Error fetching attempt:', attemptError);
      return { error: attemptError };
    }
    
    // Create or update assessment result
    const { data, error } = await supabase
      .from('assessment_results')
      .upsert({
        student_id: attempt.student_id,
        assessment_id: attempt.assessment_id,
        attempt_id: attemptId,
        total_score: attempt.final_score,
        auto_score: attempt.auto_score,
        manual_score: attempt.manual_score,
        percentage: attempt.final_score,
        grade: this.calculateGrade(attempt.final_score),
        overall_feedback: attempt.overall_feedback,
        instructor_feedback: attempt.instructor_feedback,
        show_correct_answers: showCorrectAnswers,
        show_explanations: showExplanations,
        is_final: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error publishing results:', error);
      return { error };
    }
    
    console.log('✅ Assessment results published:', data);
    return { data, error: null };
  } catch (err) {
    console.error('❌ Error in publishAssessmentResults:', err);
    return { error: err };
  }
}

// 16. Calculate Grade from Score
static calculateGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}
