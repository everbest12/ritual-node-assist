import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI lazily
let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export async function POST(request: NextRequest) {
  try {
    const { conversation, settings } = await request.json()

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Determine AI model based on settings
    const aiModel = settings?.aiModel || 'gpt-4o'

    // Create the prompt for title generation
    const systemPrompt = `You are a helpful assistant that generates concise, descriptive titles for chat conversations. 

Your task is to create a short, meaningful title (3-8 words) that captures the main topic or theme of the conversation.

Guidelines:
- Keep titles concise and descriptive
- Focus on the primary topic or question
- Use clear, professional language
- Avoid generic titles like "General Discussion"
- Make it easy to identify the conversation later

Examples:
- "Ritual Network Architecture Questions"
- "AI Model Integration Guide"
- "Blockchain Security Best Practices"
- "Decentralized Computing Setup"
- "Smart Contract Development Help"`

    const userPrompt = `Please generate a title for this conversation:

${conversation}

Title:`

    // Get response from GPT
    const response = await getOpenAI().chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 50,
      temperature: 0.7,
    })

    const title = response.choices[0]?.message?.content?.trim() || 'New Conversation'

    return NextResponse.json({ title })

  } catch (error) {
    console.error('Error in generate-title API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
