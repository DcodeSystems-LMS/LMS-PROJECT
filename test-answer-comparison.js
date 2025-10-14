// Test Answer Comparison Logic
// This script tests the answer comparison logic to ensure it works correctly

console.log('🧪 Testing Answer Comparison Logic\n');

// Test cases for different question types
const testCases = [
  {
    type: 'multiple-choice',
    userAnswer: 'To allow state and lifecycle features in function components',
    correctAnswer: 'To allow state and lifecycle features in function components',
    expected: true
  },
  {
    type: 'multiple-choice',
    userAnswer: 'to allow state and lifecycle features in function components',
    correctAnswer: 'To allow state and lifecycle features in function components',
    expected: true
  },
  {
    type: 'multiple-choice',
    userAnswer: 'useEffect',
    correctAnswer: 'useEffect',
    expected: true
  },
  {
    type: 'multiple-choice',
    userAnswer: 'useEffect',
    correctAnswer: 'useState',
    expected: false
  },
  {
    type: 'true-false',
    userAnswer: 'True',
    correctAnswer: 'True',
    expected: true
  },
  {
    type: 'true-false',
    userAnswer: 'true',
    correctAnswer: 'True',
    expected: true
  },
  {
    type: 'true-false',
    userAnswer: 'False',
    correctAnswer: 'True',
    expected: false
  },
  {
    type: 'short-answer',
    userAnswer: 'when the effect runs',
    correctAnswer: 'when the effect runs',
    expected: true
  },
  {
    type: 'short-answer',
    userAnswer: 'when the effect executes',
    correctAnswer: 'when the effect runs',
    expected: true
  },
  {
    type: 'short-answer',
    userAnswer: 'effect runs',
    correctAnswer: 'when the effect runs',
    expected: true
  },
  {
    type: 'short-answer',
    userAnswer: 'something completely different',
    correctAnswer: 'when the effect runs',
    expected: false
  }
];

// Answer comparison function (same logic as in the components)
function compareAnswers(userAnswer, correctAnswer, questionType) {
  // Normalize both answers for comparison
  const normalizedUserAnswer = String(userAnswer || '').trim().toLowerCase();
  const normalizedCorrectAnswer = String(correctAnswer || '').trim().toLowerCase();
  
  if (questionType === 'short-answer' || questionType === 'short_answer') {
    // For short answers, check if user answer contains the correct answer or vice versa
    // Also check for partial matches with key words
    const userWords = normalizedUserAnswer.split(/\s+/);
    const correctWords = normalizedCorrectAnswer.split(/\s+/);
    
    // Check if user answer contains the correct answer or vice versa
    const containsMatch = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                         normalizedCorrectAnswer.includes(normalizedUserAnswer);
    
    // Check for partial word matches (at least 50% of words match)
    const matchingWords = userWords.filter(word => correctWords.includes(word));
    const wordMatchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;
    
    return containsMatch || wordMatchRatio >= 0.5;
  } else {
    // For multiple choice and true-false, exact match (case-insensitive)
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }
}

// Run tests
let passedTests = 0;
let totalTests = testCases.length;

console.log('Running tests...\n');

testCases.forEach((testCase, index) => {
  const result = compareAnswers(testCase.userAnswer, testCase.correctAnswer, testCase.type);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Type: ${testCase.type}`);
  console.log(`  User Answer: "${testCase.userAnswer}"`);
  console.log(`  Correct Answer: "${testCase.correctAnswer}"`);
  console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
  console.log('');
  
  if (passed) passedTests++;
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Answer comparison logic is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Check the comparison logic.');
}
