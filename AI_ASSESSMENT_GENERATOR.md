# AI Assessment Generator

## Overview

The AI Assessment Generator feature allows mentors to automatically create assessment questions using AI. You can choose between **OpenAI** (GPT-4o-mini) or **Google Gemini 2.0 Flash** to generate high-quality, contextually relevant questions based on the topic, difficulty level, and other parameters you specify.

## Supported AI Providers

### 1. OpenAI (GPT-4o-mini)
- Fast response times
- Cost-effective pricing
- High-quality educational content

### 2. Google Gemini 2.0 Flash
- Fast and efficient
- Free tier available
- Excellent for educational content

### 3. DeepSeek R1 (via OpenRouter)
- Advanced reasoning capabilities
- Cost-effective access to multiple models
- Access to various AI models through one API

## Setup

### Option 1: Environment Variable (Recommended)

1. Create or update your `.env.local` file in the project root
2. Add your API keys (you can use one or more):
   ```env
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   
   # Gemini Configuration
   VITE_GEMINI_API_KEY=AIzaSy-your-api-key-here
   
   # OpenRouter Configuration
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```
3. Restart your development server

### Option 2: UI Configuration

1. Click on "AI Creation" button in the Assessments page
2. Select your preferred AI provider (OpenAI, Gemini, or DeepSeek R1)
3. Click "Configure API Key" link in the AI Assessment Generator banner
4. Enter your API key in the modal
5. Click "Save & Continue"

**Note:** The API key entered through the UI is stored locally in the browser session and will need to be re-entered if you refresh the page.

## Getting API Keys

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-`)

### Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (it starts with `AIzaSy`)

### OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (it starts with `sk-or-v1-`)

**Important:** Keep your API keys secure and never commit them to version control.

## Usage

1. Navigate to **Mentor > Assessments**
2. Click **"AI Creation"** button
3. **Select AI Provider**: Choose between OpenAI, Gemini 2.0 Flash, or DeepSeek R1 (OpenRouter)
4. Fill in the form:
   - **Topic/Subject***: Enter the topic (e.g., "React Hooks", "Database Design")
   - **Course***: Select the course from dropdown
   - **Assessment Type**: Choose Quiz, Test, or Practice
   - **Difficulty Level**: Select Easy, Medium, or Hard
   - **Number of Questions**: Enter between 5-50
   - **Time Limit**: Set time in minutes
   - **Focus Areas** (Optional): Select relevant focus areas
   - **Include explanations**: Check to include answer explanations
4. Click **"Generate with AI"**
5. Wait for generation (usually 10-30 seconds)
6. Review the generated questions
7. Edit any questions if needed
8. Click **"Save Assessment"** to save

## Features

- ✅ **Intelligent Question Generation**: Uses GPT-4o-mini for cost-effective, high-quality questions
- ✅ **Multiple Difficulty Levels**: Generates questions appropriate for Easy, Medium, or Hard levels
- ✅ **Focus Areas**: Customize questions based on specific learning areas
- ✅ **Automatic Explanations**: Option to include explanations for correct answers
- ✅ **Question Format**: Generates multiple-choice questions with 4 options
- ✅ **Seamless Integration**: Generated questions are ready to use in your assessment

## API Models

### OpenAI
The service uses **GPT-4o-mini** by default, which provides:
- Fast response times
- Cost-effective pricing
- High-quality educational content
- Good understanding of educational contexts

You can modify the model in `src/services/openAIService.ts` if needed.

### Gemini
The service uses **Gemini 2.0 Flash**, which provides:
- Very fast response times
- Free tier available
- Excellent for educational content
- Good understanding of various topics

You can modify the model in `src/services/geminiService.ts` if needed.

### OpenRouter (DeepSeek R1)
The service uses **DeepSeek R1** via OpenRouter, which provides:
- Advanced reasoning capabilities
- Access to multiple AI models through one API
- Cost-effective pricing
- Flexible model selection

You can modify the model in `src/services/openRouterService.ts` if needed. Default model is `deepseek/deepseek-r1`.

## Error Handling

If you encounter errors:

1. **"API key is not configured"**
   - Set the API key via environment variable or UI
   - Ensure the key is valid and active
   - Make sure you've selected the correct AI provider

2. **"API error"**
   - Check your API key is correct
   - Verify you have credits/quota available (OpenAI) or free tier access (Gemini)
   - Check your internet connection
   - Try switching to the other AI provider

3. **"Failed to generate questions"**
   - Try again with a different topic
   - Reduce the number of questions
   - Check the AI service status
   - Try switching between OpenAI and Gemini

## Cost Considerations

### OpenAI
- GPT-4o-mini is cost-effective (~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens)
- Generating 10 questions typically costs less than $0.01
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### Gemini
- Gemini 2.0 Flash offers a free tier with generous limits
- Free tier: 15 requests per minute
- Paid tier available for higher usage
- Monitor your usage at [Google AI Studio](https://makersuite.google.com/)

### OpenRouter
- Pay-per-use pricing model
- Access to multiple models with different pricing
- DeepSeek R1 is cost-effective for question generation
- Monitor your usage at [OpenRouter Dashboard](https://openrouter.ai/activity)

## Security Notes

- ✅ API key is stored securely (environment variable or local session)
- ✅ API calls are made directly from frontend (consider backend proxy for production)
- ✅ No API key is exposed in the UI after configuration
- ⚠️ For production, consider moving API calls to backend for better security

## Troubleshooting

### Questions not generating
- Verify API key is set correctly
- Check browser console for errors
- Ensure topic is not empty
- Try with a simpler topic

### Questions are generic
- Be more specific with the topic
- Add focus areas for better context
- Increase difficulty level for more challenging questions

### API key not saving
- For environment variable: Restart dev server after adding
- For UI: Key is session-based, re-enter if page refreshes

## Future Enhancements

Potential improvements:
- Support for other question types (True/False, Short Answer, etc.)
- Backend API proxy for enhanced security
- Question quality scoring
- Batch generation for multiple topics
- Template-based generation
- Integration with question bank

---

**Last Updated**: 2024
**Status**: ✅ Ready to use

