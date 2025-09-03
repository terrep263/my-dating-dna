import OpenAI from 'openai';

// Initialize OpenAI client with error handling
let openai = null;

try {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  } else {
    console.warn('OpenAI API key not found. AI features will be disabled.');
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
}

// Core AI insight generation function
export const generateAIInsight = async (prompt, maxTokens = 500) => {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized. Please check your API key configuration.');
    }

    const completion = await openai.chat.completions.create({
      model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return a fallback response instead of throwing
    return `I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later or contact support if the issue persists.`;
  }
};

// Generate follow-up questions for assessments
export const generateFollowUpQuestion = async (currentAnswer, dnaStrand, questionContext) => {
  try {
    const prompt = `Based on this dating assessment context:
    
    User's answer: "${currentAnswer}"
    DNA Strand being assessed: ${dnaStrand}
    Question context: ${questionContext}
    
    Generate 1 natural, conversational follow-up question to better understand their ${dnaStrand} preferences. 
    Make it relevant to dating and relationships. Keep it under 100 words.`;
    
    return await generateAIInsight(prompt, 150);
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    return `Can you tell me more about that?`;
  }
};

// Generate personalized insights based on DNA type
export const generatePersonalizedInsight = async (dnaType, userAnswers, insightType) => {
  try {
    const prompt = `Generate a personalized ${insightType} insight for someone with dating DNA type ${dnaType}.
    
    User's key answers: ${JSON.stringify(userAnswers)}
    
    Focus on practical, actionable advice that's specific to their personality type.
    Keep it conversational and encouraging. Maximum 200 words.`;
    
    return await generateAIInsight(prompt, 300);
  } catch (error) {
    console.error('Error generating personalized insight:', error);
    return `Based on your answers, you have a unique dating style. Consider what makes you feel most comfortable and authentic in relationships.`;
  }
};

// Generate relationship advice based on specific situation
export const generateRelationshipAdvice = async (dnaType, situation, userQuestion) => {
  try {
    const prompt = `You are Grace, an AI relationship coach with a warm, empathetic personality. 
    
    User's DNA type: ${dnaType}
    Their situation: ${situation}
    Their question: ${userQuestion}
    
    Respond as Grace would:
    - Start with warm empathy: "I understand how hard that can feel..." or similar
    - Provide practical, personalized advice considering their personality traits
    - Include 2-3 specific action steps
    - End with encouragement and clear next steps
    - Use everyday language, short sentences
    - Be non-judgmental and validating
    - Occasionally remind them you're AI but phrase it naturally
    - Keep it encouraging and helpful
    - Maximum 300 words`;
    
    return await generateAIInsight(prompt, 400);
  } catch (error) {
    console.error('Error generating relationship advice:', error);
    return `I understand how challenging this situation can be. While I'm having trouble accessing my full AI capabilities right now, I'd recommend taking some time to reflect on what you truly want and need in this relationship. Sometimes stepping back helps us see things more clearly.`;
  }
};

// Generate compatibility analysis between two DNA types
export const generateCompatibilityAnalysis = async (type1, type2, context) => {
  try {
    const prompt = `Analyze the compatibility between two dating DNA types:
    
    Person 1: ${type1}
    Person 2: ${type2}
    Context: ${context}
    
    Provide:
    1. Compatibility score (1-100)
    2. Key strengths of this pairing
    3. Potential challenges
    4. 3 specific tips for making it work
    
    Keep it practical and relationship-focused.`;
    
    return await generateAIInsight(prompt, 500);
  } catch (error) {
    console.error('Error generating compatibility analysis:', error);
    return `Every relationship has unique dynamics. Focus on open communication, mutual respect, and understanding each other's needs. Compatibility is built through effort and care.`;
  }
};

// Generate dynamic assessment questions
export const generateDynamicQuestion = async (dnaStrand, previousAnswers, questionNumber) => {
  try {
    const prompt = `Generate a dating assessment question for DNA strand: ${dnaStrand}
    
    Previous answers: ${JSON.stringify(previousAnswers)}
    Question number: ${questionNumber}
    
    Create a question that:
    - Is relevant to dating and relationships
    - Helps determine their ${dnaStrand} preferences
    - Feels natural and conversational
    - Is different from typical assessment questions
    
    Return only the question, no explanations.`;
    
    return await generateAIInsight(prompt, 100);
  } catch (error) {
    console.error('Error generating dynamic question:', error);
    return `How do you typically approach new relationships?`;
  }
};

// Check if OpenAI is properly configured
export const checkOpenAIConfig = () => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const model = process.env.REACT_APP_OPENAI_MODEL;
  
  return {
    hasApiKey: !!apiKey,
    model: model || 'gpt-3.5-turbo',
    isConfigured: !!apiKey,
    clientInitialized: !!openai
  };
};
