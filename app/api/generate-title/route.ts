import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '../../utils/openai'

export async function POST(request: NextRequest) {
  try {
    const { conversation, settings } = await request.json()
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation is required' },
        { status: 400 }
      )
    }

    const client = getOpenAIClient()
    const aiModel = settings?.aiModel || 'gpt-4o'

    const completion = await client.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates concise, descriptive titles for chat conversations about Ritual Network. 
          
          Generate a title that:
          - Is 3-8 words long
          - Captures the main topic or theme
          - Is engaging and informative
          - Relates to Ritual Network, decentralized AI, or blockchain technology
          
          Examples:
          - "Getting Started with Ritual Network"
          - "Understanding Zero-Knowledge Proofs"
          - "DAO Governance and $RITUAL Tokens"
          - "Cross-Chain AI Infrastructure"
          - "Privacy-Preserving AI Computations"`
        },
        {
          role: 'user',
          content: `Generate a title for this conversation:\n\n${conversation}`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    })

    const title = completion.choices[0]?.message?.content?.trim() || 'New Conversation'

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating title:', error)
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    )
  }
}
