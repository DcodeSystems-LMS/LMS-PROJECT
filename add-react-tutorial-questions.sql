-- Add React Tutorial Questions to the React Fundamentals Quiz
-- This script adds comprehensive React tutorial questions to the existing quiz

-- First, let's find the React Fundamentals Quiz assessment
-- We'll use a more specific approach to get the assessment ID

-- Create React tutorial questions for the React Fundamentals Quiz
-- These questions cover React basics, components, hooks, and state management

-- Question 1: What is React?
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is React?',
    'multiple-choice',
    '["A JavaScript library for building user interfaces", "A database management system", "A server-side framework", "A programming language"]'::jsonb,
    '0',
    'React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications.',
    2,
    1,
    'easy',
    ARRAY['react', 'basics', 'definition']
);

-- Question 2: React Components
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What are React components?',
    'multiple-choice',
    '["Reusable pieces of UI", "Database tables", "Server endpoints", "CSS files"]'::jsonb,
    '0',
    'React components are reusable pieces of UI that can be composed together to build complex user interfaces.',
    2,
    2,
    'easy',
    ARRAY['react', 'components', 'ui']
);

-- Question 3: JSX
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is JSX?',
    'multiple-choice',
    '["A syntax extension for JavaScript", "A new programming language", "A database query language", "A CSS preprocessor"]'::jsonb,
    '0',
    'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
    2,
    3,
    'medium',
    ARRAY['react', 'jsx', 'syntax']
);

-- Question 4: Props
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What are props in React?',
    'multiple-choice',
    '["Data passed from parent to child components", "Internal component state", "Event handlers", "CSS styles"]'::jsonb,
    '0',
    'Props (short for properties) are data passed from parent components to child components in React.',
    2,
    4,
    'medium',
    ARRAY['react', 'props', 'data-flow']
);

-- Question 5: State
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is state in React?',
    'multiple-choice',
    '["Internal data that can change over time", "External API data", "CSS properties", "Database records"]'::jsonb,
    '0',
    'State is internal data that can change over time and causes the component to re-render when updated.',
    2,
    5,
    'medium',
    ARRAY['react', 'state', 'data']
);

-- Question 6: useState Hook
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What does the useState hook do?',
    'multiple-choice',
    '["Adds state to functional components", "Creates new components", "Handles API calls", "Manages routing"]'::jsonb,
    '0',
    'The useState hook allows functional components to have state by providing a state variable and a function to update it.',
    3,
    6,
    'medium',
    ARRAY['react', 'hooks', 'usestate']
);

-- Question 7: useEffect Hook
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is the useEffect hook used for?',
    'multiple-choice',
    '["Performing side effects in functional components", "Creating new components", "Styling components", "Managing props"]'::jsonb,
    '0',
    'The useEffect hook is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.',
    3,
    7,
    'medium',
    ARRAY['react', 'hooks', 'useeffect']
);

-- Question 8: Event Handling
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'How do you handle events in React?',
    'multiple-choice',
    '["Using camelCase event handlers like onClick", "Using lowercase event handlers like onclick", "Using kebab-case like on-click", "Events are not supported in React"]'::jsonb,
    '0',
    'React uses camelCase for event handlers (onClick, onChange, etc.) and passes a synthetic event object to the handler.',
    2,
    8,
    'easy',
    ARRAY['react', 'events', 'handlers']
);

-- Question 9: Conditional Rendering
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'How do you conditionally render content in React?',
    'multiple-choice',
    '["Using JavaScript expressions with && or ternary operators", "Using CSS display properties", "Using HTML conditional tags", "Using special React conditional components"]'::jsonb,
    '0',
    'React allows conditional rendering using JavaScript expressions like {condition && <Component />} or {condition ? <Component1 /> : <Component2 />}.',
    3,
    9,
    'medium',
    ARRAY['react', 'conditional', 'rendering']
);

-- Question 10: Lists and Keys
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'Why do you need keys when rendering lists in React?',
    'multiple-choice',
    '["To help React identify which items have changed", "To make the list look better", "To improve performance", "Keys are not needed in React"]'::jsonb,
    '0',
    'Keys help React identify which items have changed, been added, or removed, enabling efficient updates to the DOM.',
    3,
    10,
    'medium',
    ARRAY['react', 'lists', 'keys']
);

-- Question 11: Component Lifecycle (True/False)
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'Functional components have lifecycle methods like componentDidMount.',
    'true-false',
    NULL,
    'false',
    'Functional components do not have lifecycle methods. Class components have lifecycle methods, while functional components use hooks like useEffect.',
    2,
    11,
    'medium',
    ARRAY['react', 'lifecycle', 'components']
);

-- Question 12: Virtual DOM
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is the Virtual DOM?',
    'multiple-choice',
    '["A JavaScript representation of the real DOM", "A database for storing DOM elements", "A CSS framework", "A server-side rendering technique"]'::jsonb,
    '0',
    'The Virtual DOM is a JavaScript representation of the real DOM that React uses to efficiently update the UI.',
    3,
    12,
    'medium',
    ARRAY['react', 'virtual-dom', 'performance']
);

-- Question 13: Controlled Components
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is a controlled component?',
    'multiple-choice',
    '["A component whose value is controlled by React state", "A component that controls other components", "A component with no state", "A component that cannot be updated"]'::jsonb,
    '0',
    'A controlled component is a form element whose value is controlled by React state, allowing React to control the input.',
    3,
    13,
    'medium',
    ARRAY['react', 'controlled', 'forms']
);

-- Question 14: React Router
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'What is React Router used for?',
    'multiple-choice',
    '["Client-side routing in React applications", "Server-side routing", "Database routing", "CSS routing"]'::jsonb,
    '0',
    'React Router is a library that provides client-side routing capabilities for React applications.',
    2,
    14,
    'medium',
    ARRAY['react', 'router', 'routing']
);

-- Question 15: React Best Practices
INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags
) VALUES (
    (SELECT id FROM public.assessments WHERE title = 'React Fundamentals Quiz' LIMIT 1),
    'Which is a React best practice?',
    'multiple-choice',
    '["Keep components small and focused", "Use class components for everything", "Avoid using hooks", "Put all logic in one component"]'::jsonb,
    '0',
    'Keeping components small and focused makes them easier to understand, test, and maintain.',
    2,
    15,
    'easy',
    ARRAY['react', 'best-practices', 'components']
);

-- Update the assessment to reflect that it now has questions
UPDATE public.assessments 
SET updated_at = NOW()
WHERE title = 'React Fundamentals Quiz';

-- Display success message
SELECT 'React Tutorial Questions Added Successfully!' as message;




