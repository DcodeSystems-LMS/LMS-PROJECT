// Assessment Metadata Service
import { supabase } from '@/lib/supabase';

export interface AssessmentMetadata {
  id: string;
  assessmentId: string;
  tags: string[];
  weightage: number;
  category: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  language: string;
  bloomTaxonomyLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  visibility: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionMetadata {
  id: string;
  questionId: string;
  points: number;
  negativeMarking: number;
  sectionId?: string;
  sectionName?: string;
  questionOrder: number;
  mediaFiles: MediaFile[];
  richTextContent?: string;
  codeLanguage?: string;
  codeTemplate?: string;
  testCases: TestCase[];
  bloomLevel: string;
  difficulty: number;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  altText?: string;
  caption?: string;
  size: number;
  mimeType: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

export interface AssessmentSection {
  id: string;
  assessmentId: string;
  name: string;
  description?: string;
  sectionType: 'mixed' | 'mcq' | 'coding' | 'essay' | 'file_upload';
  timeLimit?: number;
  orderIndex: number;
  instructions?: string;
  questions: QuestionMetadata[];
}

export class AssessmentMetadataService {
  private static instance: AssessmentMetadataService;

  static getInstance(): AssessmentMetadataService {
    if (!AssessmentMetadataService.instance) {
      AssessmentMetadataService.instance = new AssessmentMetadataService();
    }
    return AssessmentMetadataService.instance;
  }

  // Update assessment metadata
  async updateAssessmentMetadata(
    assessmentId: string,
    metadata: Partial<AssessmentMetadata>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({
          tags: metadata.tags,
          weightage: metadata.weightage,
          category: metadata.category,
          difficulty_level: metadata.difficultyLevel,
          language: metadata.language,
          bloom_taxonomy_level: metadata.bloomTaxonomyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) {
        console.error('Error updating assessment metadata:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAssessmentMetadata:', error);
      return { success: false, error: 'Failed to update assessment metadata' };
    }
  }

  // Get assessment metadata
  async getAssessmentMetadata(
    assessmentId: string
  ): Promise<{ metadata: AssessmentMetadata | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, tags, weightage, category, difficulty_level, language, bloom_taxonomy_level, status, mentor_id, created_at, updated_at')
        .eq('id', assessmentId)
        .single();

      if (error) {
        console.error('Error fetching assessment metadata:', error);
        return { metadata: null, error: error.message };
      }

      const metadata: AssessmentMetadata = {
        id: data.id,
        assessmentId: data.id,
        tags: data.tags || [],
        weightage: data.weightage || 0,
        category: data.category || '',
        difficultyLevel: data.difficulty_level || 'medium',
        language: data.language || 'en',
        bloomTaxonomyLevel: data.bloom_taxonomy_level || 'remember',
        visibility: data.status || 'draft',
        createdBy: data.mentor_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { metadata };
    } catch (error) {
      console.error('Error in getAssessmentMetadata:', error);
      return { metadata: null, error: 'Failed to fetch assessment metadata' };
    }
  }

  // Create assessment section
  async createAssessmentSection(
    assessmentId: string,
    sectionData: Partial<AssessmentSection>
  ): Promise<{ success: boolean; section?: AssessmentSection; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('assessment_sections')
        .insert({
          assessment_id: assessmentId,
          name: sectionData.name,
          description: sectionData.description,
          section_type: sectionData.sectionType || 'mixed',
          time_limit: sectionData.timeLimit,
          order_index: sectionData.orderIndex || 0,
          instructions: sectionData.instructions
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating assessment section:', error);
        return { success: false, error: error.message };
      }

      const section: AssessmentSection = {
        id: data.id,
        assessmentId: data.assessment_id,
        name: data.name,
        description: data.description,
        sectionType: data.section_type,
        timeLimit: data.time_limit,
        orderIndex: data.order_index,
        instructions: data.instructions,
        questions: []
      };

      return { success: true, section };
    } catch (error) {
      console.error('Error in createAssessmentSection:', error);
      return { success: false, error: 'Failed to create assessment section' };
    }
  }

  // Get assessment sections
  async getAssessmentSections(
    assessmentId: string
  ): Promise<{ sections: AssessmentSection[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('assessment_sections')
        .select(`
          *,
          questions:questions(
            id,
            question_text,
            question_type,
            points,
            negative_marking,
            section_id,
            section_name,
            question_order,
            media_files,
            rich_text_content,
            code_language,
            code_template,
            test_cases
          )
        `)
        .eq('assessment_id', assessmentId)
        .order('order_index');

      if (error) {
        console.error('Error fetching assessment sections:', error);
        return { sections: [], error: error.message };
      }

      const sections: AssessmentSection[] = (data || []).map(section => ({
        id: section.id,
        assessmentId: section.assessment_id,
        name: section.name,
        description: section.description,
        sectionType: section.section_type,
        timeLimit: section.time_limit,
        orderIndex: section.order_index,
        instructions: section.instructions,
        questions: (section.questions || []).map(this.mapQuestionMetadata)
      }));

      return { sections };
    } catch (error) {
      console.error('Error in getAssessmentSections:', error);
      return { sections: [], error: 'Failed to fetch assessment sections' };
    }
  }

  // Update question metadata
  async updateQuestionMetadata(
    questionId: string,
    metadata: Partial<QuestionMetadata>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          points: metadata.points,
          negative_marking: metadata.negativeMarking,
          section_id: metadata.sectionId,
          section_name: metadata.sectionName,
          question_order: metadata.questionOrder,
          media_files: metadata.mediaFiles,
          rich_text_content: metadata.richTextContent,
          code_language: metadata.codeLanguage,
          code_template: metadata.codeTemplate,
          test_cases: metadata.testCases,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) {
        console.error('Error updating question metadata:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateQuestionMetadata:', error);
      return { success: false, error: 'Failed to update question metadata' };
    }
  }

  // Get question metadata
  async getQuestionMetadata(
    questionId: string
  ): Promise<{ metadata: QuestionMetadata | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (error) {
        console.error('Error fetching question metadata:', error);
        return { metadata: null, error: error.message };
      }

      const metadata: QuestionMetadata = this.mapQuestionMetadata(data);
      return { metadata };
    } catch (error) {
      console.error('Error in getQuestionMetadata:', error);
      return { metadata: null, error: 'Failed to fetch question metadata' };
    }
  }

  // Map database data to QuestionMetadata
  private mapQuestionMetadata(data: any): QuestionMetadata {
    return {
      id: data.id,
      questionId: data.id,
      points: data.points || 1,
      negativeMarking: data.negative_marking || 0,
      sectionId: data.section_id,
      sectionName: data.section_name,
      questionOrder: data.question_order || 0,
      mediaFiles: data.media_files || [],
      richTextContent: data.rich_text_content,
      codeLanguage: data.code_language,
      codeTemplate: data.code_template,
      testCases: data.test_cases || [],
      bloomLevel: data.bloom_taxonomy_level || 'remember',
      difficulty: data.difficulty_score || 0.5
    };
  }

  // Search assessments by metadata
  async searchAssessmentsByMetadata(
    filters: {
      tags?: string[];
      category?: string;
      difficultyLevel?: string;
      language?: string;
      bloomLevel?: string;
      weightageMin?: number;
      weightageMax?: number;
    },
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ assessments: any[]; total: number; error?: string }> {
    try {
      let query = supabase
        .from('assessments')
        .select('*', { count: 'exact' })
        .eq('mentor_id', userId);

      // Apply filters
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.difficultyLevel) {
        query = query.eq('difficulty_level', filters.difficultyLevel);
      }

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      if (filters.bloomLevel) {
        query = query.eq('bloom_taxonomy_level', filters.bloomLevel);
      }

      if (filters.weightageMin !== undefined) {
        query = query.gte('weightage', filters.weightageMin);
      }

      if (filters.weightageMax !== undefined) {
        query = query.lte('weightage', filters.weightageMax);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching assessments:', error);
        return { assessments: [], total: 0, error: error.message };
      }

      return { assessments: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error in searchAssessmentsByMetadata:', error);
      return { assessments: [], total: 0, error: 'Failed to search assessments' };
    }
  }

  // Get popular tags
  async getPopularTags(
    userId: string,
    limit: number = 20
  ): Promise<{ tags: Array<{ tag: string; count: number }>; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('tags')
        .eq('mentor_id', userId);

      if (error) {
        console.error('Error fetching tags:', error);
        return { tags: [], error: error.message };
      }

      // Count tag occurrences
      const tagCounts: Record<string, number> = {};
      (data || []).forEach(assessment => {
        (assessment.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const tags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return { tags };
    } catch (error) {
      console.error('Error in getPopularTags:', error);
      return { tags: [], error: 'Failed to fetch popular tags' };
    }
  }

  // Get assessment categories
  async getAssessmentCategories(
    userId: string
  ): Promise<{ categories: Array<{ category: string; count: number }>; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('category')
        .eq('mentor_id', userId)
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return { categories: [], error: error.message };
      }

      // Count category occurrences
      const categoryCounts: Record<string, number> = {};
      (data || []).forEach(assessment => {
        if (assessment.category) {
          categoryCounts[assessment.category] = (categoryCounts[assessment.category] || 0) + 1;
        }
      });

      const categories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      return { categories };
    } catch (error) {
      console.error('Error in getAssessmentCategories:', error);
      return { categories: [], error: 'Failed to fetch categories' };
    }
  }
}

export const assessmentMetadataService = AssessmentMetadataService.getInstance();
