// Add React Tutorial Questions to the React Fundamentals Quiz
// This script adds comprehensive React tutorial questions to the existing quiz

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// React tutorial questions data
const reactQuestions = [
  {
    question_text: 'What is React?',
    question_type: 'multiple-choice',
    options: [
      'A JavaScript library for building user interfaces',
      'A database management system',
      'A server-side framework',
      'A programming language'
    ],
    correct_answer: '0',
    explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications.',
    points: 2,
    order_index: 1,
    difficulty_level: 'easy',
    tags: ['react', 'basics', 'definition']
  },
  {
    question_text: 'What are React components?',
    question_type: 'multiple-choice',
    options: [
      'Reusable pieces of UI',
      'Database tables',
      'Server endpoints',
      'CSS files'
    ],
    correct_answer: '0',
    explanation: 'React components are reusable pieces of UI that can be composed together to build complex user interfaces.',
    points: 2,
    order_index: 2,
    difficulty_level: 'easy',
    tags: ['react', 'components', 'ui']
  },
  {
    question_text: 'What is JSX?',
    question_type: 'multiple-choice',
    options: [
      'A syntax extension for JavaScript',
      'A new programming language',
      'A database query language',
      'A CSS preprocessor'
    ],
    correct_answer: '0',
    explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
    points: 2,
    order_index: 3,
    difficulty_level: 'medium',
    tags: ['react', 'jsx', 'syntax']
  },
  {
    question_text: 'What are props in React?',
    question_type: 'multiple-choice',
    options: [
      'Data passed from parent to child components',
      'Internal component state',
      'Event handlers',
      'CSS styles'
    ],
    correct_answer: '0',
    explanation: 'Props (short for properties) are data passed from parent components to child components in React.',
    points: 2,
    order_index: 4,
    difficulty_level: 'medium',
    tags: ['react', 'props', 'data-flow']
  },
  {
    question_text: 'What is state in React?',
    question_type: 'multiple-choice',
    options: [
      'Internal data that can change over time',
      'External API data',
      'CSS properties',
      'Database records'
    ],
    correct_answer: '0',
    explanation: 'State is internal data that can change over time and causes the component to re-render when updated.',
    points: 2,
    order_index: 5,
    difficulty_level: 'medium',
    tags: ['react', 'state', 'data']
  },
  {
    question_text: 'What does the useState hook do?',
    question_type: 'multiple-choice',
    options: [
      'Adds state to functional components',
      'Creates new components',
      'Handles API calls',
      'Manages routing'
    ],
    correct_answer: '0',
    explanation: 'The useState hook allows functional components to have state by providing a state variable and a function to update it.',
    points: 3,
    order_index: 6,
    difficulty_level: 'medium',
    tags: ['react', 'hooks', 'usestate']
  },
  {
    question_text: 'What is the useEffect hook used for?',
    question_type: 'multiple-choice',
    options: [
      'Performing side effects in functional components',
      'Creating new components',
      'Styling components',
      'Managing props'
    ],
    correct_answer: '0',
    explanation: 'The useEffect hook is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.',
    points: 3,
    order_index: 7,
    difficulty_level: 'medium',
    tags: ['react', 'hooks', 'useeffect']
  },
  {
    question_text: 'How do you handle events in React?',
    question_type: 'multiple-choice',
    options: [
      'Using camelCase event handlers like onClick',
      'Using lowercase event handlers like onclick',
      'Using kebab-case like on-click',
      'Events are not supported in React'
    ],
    correct_answer: '0',
    explanation: 'React uses camelCase for event handlers (onClick, onChange, etc.) and passes a synthetic event object to the handler.',
    points: 2,
    order_index: 8,
    difficulty_level: 'easy',
    tags: ['react', 'events', 'handlers']
  },
  {
    question_text: 'How do you conditionally render content in React?',
    question_type: 'multiple-choice',
    options: [
      'Using JavaScript expressions with && or ternary operators',
      'Using CSS display properties',
      'Using HTML conditional tags',
      'Using special React conditional components'
    ],
    correct_answer: '0',
    explanation: 'React allows conditional rendering using JavaScript expressions like {condition && <Component />} or {condition ? <Component1 /> : <Component2 />}.',
    points: 3,
    order_index: 9,
    difficulty_level: 'medium',
    tags: ['react', 'conditional', 'rendering']
  },
  {
    question_text: 'Why do you need keys when rendering lists in React?',
    question_type: 'multiple-choice',
    options: [
      'To help React identify which items have changed',
      'To make the list look better',
      'To improve performance',
      'Keys are not needed in React'
    ],
    correct_answer: '0',
    explanation: 'Keys help React identify which items have changed, been added, or removed, enabling efficient updates to the DOM.',
    points: 3,
    order_index: 10,
    difficulty_level: 'medium',
    tags: ['react', 'lists', 'keys']
  },
  {
    question_text: 'Functional components have lifecycle methods like componentDidMount.',
    question_type: 'true-false',
    options: null,
    correct_answer: 'false',
    explanation: 'Functional components do not have lifecycle methods. Class components have lifecycle methods, while functional components use hooks like useEffect.',
    points: 2,
    order_index: 11,
    difficulty_level: 'medium',
    tags: ['react', 'lifecycle', 'components']
  },
  {
    question_text: 'What is the Virtual DOM?',
    question_type: 'multiple-choice',
    options: [
      'A JavaScript representation of the real DOM',
      'A database for storing DOM elements',
      'A CSS framework',
      'A server-side rendering technique'
    ],
    correct_answer: '0',
    explanation: 'The Virtual DOM is a JavaScript representation of the real DOM that React uses to efficiently update the UI.',
    points: 3,
    order_index: 12,
    difficulty_level: 'medium',
    tags: ['react', 'virtual-dom', 'performance']
  },
  {
    question_text: 'What is a controlled component?',
    question_type: 'multiple-choice',
    options: [
      'A component whose value is controlled by React state',
      'A component that controls other components',
      'A component with no state',
      'A component that cannot be updated'
    ],
    correct_answer: '0',
    explanation: 'A controlled component is a form element whose value is controlled by React state, allowing React to control the input.',
    points: 3,
    order_index: 13,
    difficulty_level: 'medium',
    tags: ['react', 'controlled', 'forms']
  },
  {
    question_text: 'What is React Router used for?',
    question_type: 'multiple-choice',
    options: [
      'Client-side routing in React applications',
      'Server-side routing',
      'Database routing',
      'CSS routing'
    ],
    correct_answer: '0',
    explanation: 'React Router is a library that provides client-side routing capabilities for React applications.',
    points: 2,
    order_index: 14,
    difficulty_level: 'medium',
    tags: ['react', 'router', 'routing']
  },
  {
    question_text: 'Which is a React best practice?',
    question_type: 'multiple-choice',
    options: [
      'Keep components small and focused',
      'Use class components for everything',
      'Avoid using hooks',
      'Put all logic in one component'
    ],
    correct_answer: '0',
    explanation: 'Keeping components small and focused makes them easier to understand, test, and maintain.',
    points: 2,
    order_index: 15,
    difficulty_level: 'easy',
    tags: ['react', 'best-practices', 'components']
  }
];

async function addReactQuestions() {
  try {
    console.log('🚀 Starting to add React tutorial questions...');

    // First, find the React Fundamentals Quiz assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title')
      .eq('title', 'React Fundamentals Quiz')
      .single();

    if (assessmentError) {
      console.error('❌ Error finding assessment:', assessmentError);
      return;
    }

    if (!assessment) {
      console.error('❌ React Fundamentals Quiz not found');
      return;
    }

    console.log('✅ Found assessment:', assessment.title, 'ID:', assessment.id);

    // Add each question
    for (const questionData of reactQuestions) {
      const questionToInsert = {
        assessment_id: assessment.id,
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        options: questionData.options ? JSON.stringify(questionData.options) : null,
        correct_answer: questionData.correct_answer,
        explanation: questionData.explanation,
        points: questionData.points,
        order_index: questionData.order_index,
        difficulty_level: questionData.difficulty_level,
        tags: questionData.tags
      };

      const { data, error } = await supabase
        .from('questions')
        .insert(questionToInsert)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding question ${questionData.order_index}:`, error);
      } else {
        console.log(`✅ Added question ${questionData.order_index}: ${questionData.question_text}`);
      }
    }

    // Update the assessment
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', assessment.id);

    if (updateError) {
      console.error('❌ Error updating assessment:', updateError);
    } else {
      console.log('✅ Assessment updated successfully');
    }

    console.log('🎉 React tutorial questions added successfully!');
    console.log(`📊 Total questions added: ${reactQuestions.length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
addReactQuestions();




