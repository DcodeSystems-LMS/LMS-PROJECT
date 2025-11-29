// Learning Path Service - Supabase Functions
// This file exports functions to interact with learning paths in Supabase

import { supabase } from '@/lib/supabase';

export interface LearningPathData {
  title: string;
  description: string;
  thumbnail?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  units: UnitData[];
  finalTest?: TestData | null;
  mentorId: string;
}

export interface UnitData {
  title: string;
  description: string;
  order: number;
  modules: ModuleData[];
  test?: TestData | null;
}

export interface ModuleData {
  title: string;
  contentType: 'PDF' | 'Video' | 'Text' | 'Quiz' | 'Assignment';
  content?: string;
  fileUrl?: string;
  duration: number;
  order: number;
}

export interface TestData {
  name: string;
  questions: QuestionData[];
  passPercentage: number;
  totalMarks: number;
}

export interface QuestionData {
  type: 'multiple-choice' | 'true-false' | 'fill-blanks' | 'coding';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

/**
 * Save a complete learning path to Supabase
 */
export async function saveLearningPath(data: LearningPathData) {
  try {
    // 1. Insert learning path
    const { data: learningPath, error: pathError } = await supabase
      .from('learning_paths')
      .insert({
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail,
        level: data.level,
        duration: data.duration,
        mentor_id: data.mentorId,
        total_units: data.units.length,
        total_modules: data.units.reduce((sum, unit) => sum + unit.modules.length, 0),
        total_tests: data.units.filter(u => u.test).length + (data.finalTest ? 1 : 0),
      })
      .select()
      .single();

    if (pathError) throw pathError;
    if (!learningPath) throw new Error('Failed to create learning path');

    const learningPathId = learningPath.id;

    // 2. Insert units and their modules
    for (const unit of data.units) {
      const { data: unitData, error: unitError } = await supabase
        .from('learning_path_units')
        .insert({
          learning_path_id: learningPathId,
          title: unit.title,
          description: unit.description,
          order_number: unit.order,
        })
        .select()
        .single();

      if (unitError) throw unitError;
      if (!unitData) continue;

      const unitId = unitData.id;

      // Insert modules for this unit
      for (const module of unit.modules) {
        const { error: moduleError } = await supabase
          .from('learning_path_modules')
          .insert({
            unit_id: unitId,
            title: module.title,
            content_type: module.contentType,
            content: module.content || null,
            file_url: module.fileUrl || null,
            duration: module.duration,
            order_number: module.order,
          });

        if (moduleError) throw moduleError;
      }

      // Insert unit test if exists
      if (unit.test) {
        const { data: testData, error: testError } = await supabase
          .from('learning_path_tests')
          .insert({
            unit_id: unitId,
            name: unit.test.name,
            test_type: 'unit',
            pass_percentage: unit.test.passPercentage,
            total_marks: unit.test.totalMarks,
          })
          .select()
          .single();

        if (testError) throw testError;
        if (testData) {
          // Insert questions for unit test
          await insertQuestions(testData.id, unit.test.questions);
        }
      }
    }

    // 3. Insert final test if exists
    if (data.finalTest) {
      const { data: finalTestData, error: finalTestError } = await supabase
        .from('learning_path_tests')
        .insert({
          learning_path_id: learningPathId,
          name: data.finalTest.name,
          test_type: 'final',
          pass_percentage: data.finalTest.passPercentage,
          total_marks: data.finalTest.totalMarks,
        })
        .select()
        .single();

      if (finalTestError) throw finalTestError;
      if (finalTestData) {
        // Insert questions for final test
        await insertQuestions(finalTestData.id, data.finalTest.questions);
      }
    }

    return { success: true, learningPathId };
  } catch (error: any) {
    console.error('Error saving learning path:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to insert questions
 */
async function insertQuestions(testId: string, questions: QuestionData[]) {
  const questionsToInsert = questions.map((q, index) => ({
    test_id: testId,
    question_type: q.type,
    question: q.question,
    options: q.options ? q.options : null,
    correct_answer: q.correctAnswer ? q.correctAnswer : null,
    points: q.points,
    explanation: q.explanation || null,
    order_number: index + 1,
  }));

  const { error } = await supabase
    .from('learning_path_questions')
    .insert(questionsToInsert);

  if (error) throw error;
}

/**
 * Fetch learning paths for a mentor
 */
export async function fetchLearningPaths(mentorId: string) {
  try {
    const { data: learningPaths, error } = await supabase
      .from('learning_paths')
      .select(`
        *,
        learning_path_units (
          *,
          learning_path_modules (*),
          learning_path_tests (
            *,
            learning_path_questions (*)
          )
        ),
        learning_path_tests (
          *,
          learning_path_questions (*)
        )
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match the frontend interface
    return learningPaths?.map(transformLearningPath) || [];
  } catch (error: any) {
    console.error('Error fetching learning paths:', error);
    throw error;
  }
}

/**
 * Transform database data to frontend format
 */
function transformLearningPath(dbPath: any) {
  const units = (dbPath.learning_path_units || []).map((unit: any) => ({
    id: unit.id,
    title: unit.title,
    description: unit.description || '',
    order: unit.order_number,
    modules: (unit.learning_path_modules || []).map((module: any) => ({
      id: module.id,
      title: module.title,
      contentType: module.content_type,
      content: module.content,
      fileUrl: module.file_url,
      duration: module.duration,
      order: module.order_number,
    })),
    test: unit.learning_path_tests?.[0] ? {
      id: unit.learning_path_tests[0].id,
      name: unit.learning_path_tests[0].name,
      questions: (unit.learning_path_tests[0].learning_path_questions || []).map((q: any) => ({
        id: q.id,
        type: q.question_type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        points: q.points,
        explanation: q.explanation,
      })),
      passPercentage: unit.learning_path_tests[0].pass_percentage,
      totalMarks: unit.learning_path_tests[0].total_marks,
    } : null,
  }));

  const finalTest = dbPath.learning_path_tests?.find((t: any) => t.test_type === 'final');
  const finalTestData = finalTest ? {
    id: finalTest.id,
    name: finalTest.name,
    questions: (finalTest.learning_path_questions || []).map((q: any) => ({
      id: q.id,
      type: q.question_type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      points: q.points,
      explanation: q.explanation,
    })),
    passPercentage: finalTest.pass_percentage,
    totalMarks: finalTest.total_marks,
  } : null;

  return {
    id: dbPath.id,
    title: dbPath.title,
    description: dbPath.description,
    thumbnail: dbPath.thumbnail_url,
    level: dbPath.level,
    duration: dbPath.duration,
    units,
    finalTest: finalTestData,
    created_at: dbPath.created_at,
    updated_at: dbPath.updated_at,
    totalUnits: dbPath.total_units,
    totalModules: dbPath.total_modules,
    totalTests: dbPath.total_tests,
  };
}

/**
 * Delete a learning path
 */
export async function deleteLearningPath(learningPathId: string, mentorId: string) {
  try {
    // Verify ownership
    const { data: path, error: checkError } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('id', learningPathId)
      .eq('mentor_id', mentorId)
      .single();

    if (checkError || !path) {
      throw new Error('Learning path not found or access denied');
    }

    // Delete (cascade will handle related records)
    const { error } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', learningPathId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting learning path:', error);
    return { success: false, error: error.message };
  }
}

