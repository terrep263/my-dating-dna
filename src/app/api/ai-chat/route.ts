import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { message, userContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use server-side API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client with server API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create system prompt based on user context
    const systemPrompt = `You are Grace, an AI relationship coach with expertise in dating psychology and relationship dynamics. You have a warm, empathetic, and professional personality.

User Context:
- Name: ${userContext?.name || 'User'}
- Subscription: ${userContext?.subscription?.plan || 'free'}
- Assessment Type: ${userContext?.type || 'none'}

Your role is to:
1. Provide personalized relationship advice based on their situation
2. Help them understand their dating patterns and behaviors
3. Offer practical, actionable guidance for improving relationships
4. Be supportive, non-judgmental, and encouraging
5. Use evidence-based psychology principles
6. Keep responses conversational and engaging (max 300 words)
7. Occasionally ask follow-up questions to better understand their needs

Remember: You're an AI coach, so be transparent about your limitations while providing valuable insights.`;

    // Create user message with context
    const userMessage = `User Question: ${message}

Please provide helpful, personalized relationship advice.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response right now. Please try again.';

    // Determine response type based on content
    let responseType = 'general';
    if (aiResponse.toLowerCase().includes('advice') || aiResponse.toLowerCase().includes('suggest')) {
      responseType = 'advice';
    } else if (aiResponse.toLowerCase().includes('pattern') || aiResponse.toLowerCase().includes('understand')) {
      responseType = 'insight';
    } else if (aiResponse.toLowerCase().includes('question') || aiResponse.toLowerCase().includes('ask')) {
      responseType = 'question';
    }

    return NextResponse.json({
      content: aiResponse,
      type: responseType,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key and try again.' },
          { status: 401 }
        );
      } else if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a few minutes.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate AI response. Please try again.' },
      { status: 500 }
    );
  }
}
