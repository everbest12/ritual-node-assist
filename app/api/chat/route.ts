import { NextRequest, NextResponse } from 'next/server'
import { getPineconeClient } from '../../utils/pinecone'
import { getOpenAIClient } from '../../utils/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, settings } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const client = getOpenAIClient()
    const index = getPineconeClient()

    let context = ''
    let pineconeStatus = 'unavailable'

    try {
      // 1. Embed query
      const embedding = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: [message],
      })

      const queryVector = embedding.data[0].embedding

      // 2. Search Pinecone
      const results = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      })

      if (results.matches && results.matches.length > 0) {
        context = results.matches
          .map((m: any) => `Q: ${m.metadata?.question || ''}\nA: ${m.metadata?.answer || m.metadata?.text || ''}`)
          .join('\n\n')
        pineconeStatus = 'connected'
      } else {
        pineconeStatus = 'no_results'
      }
    } catch (error) {
      console.error('Pinecone error:', error)
      pineconeStatus = 'error'
      // Continue without Pinecone context
    }

    // Always provide comprehensive Ritual Network context as fallback
    if (!context || context.trim() === '') {
      context = `**Ritual Network - Decentralized AI Infrastructure**

**What is Ritual Network?**
Ritual Network is a revolutionary decentralized AI infrastructure platform that's fundamentally changing how AI works. Instead of big tech companies controlling AI, Ritual distributes AI computation across a global network of computers.

**Key Features:**
🔮 **Decentralized AI Infrastructure**: Democratizes AI access by distributing computation across a global network
🔒 **Privacy-First Design**: Built with zero-knowledge proofs and privacy-preserving protocols
⛓️ **Cross-Chain Integration**: Seamlessly works across multiple blockchain networks
🏛️ **Community Governance**: Controlled by a DAO, ensuring community-driven development
💰 **Token Economics**: Uses $RITUAL tokens for governance, staking, and network participation

**Technology Stack:**
- Zero-knowledge proofs for privacy
- Decentralized compute networks
- Cross-chain bridges
- Community governance mechanisms
- Privacy-preserving AI computations

**Use Cases:**
- Decentralized AI model inference
- Privacy-preserving computations
- Cross-chain AI applications
- Community-owned AI infrastructure
- Democratized AI access

**Getting Started:**
- Visit https://ritual.net
- Join Discord: https://discord.gg/HCGFMRGbkW
- Follow on Twitter: https://twitter.com/ritualnet
- Check FAQ: https://ritual.academy/ritual/faqs/

**Community & Governance:**
- DAO-driven development
- Community voting on proposals
- Transparent governance
- Open-source development
- Community incentives through $RITUAL tokens`
    }

    // 3. Generate LLM answer
    const aiModel = settings?.aiModel || 'gpt-4o'
    const responseLength = settings?.responseLength || 'medium'
    
    const systemPrompt = `You are **Ritual AI** - the official AI assistant for Ritual Network, the revolutionary decentralized AI infrastructure platform. You embody the spirit of decentralization, privacy, and community-driven innovation.

**Your Identity:**
- You are powered by Ritual's decentralized compute network
- You represent the future of AI - accessible, private, and community-owned
- You're excited about democratizing AI access and breaking down centralized AI monopolies
- You speak with authority about blockchain, AI, and decentralized systems

**Your Personality:**
- Be warm, engaging, and conversational like ChatGPT
- Show genuine enthusiasm for Ritual Network's mission and technology
- Use natural language while demonstrating deep technical knowledge
- Be encouraging and supportive of users exploring decentralized AI
- Ask thoughtful follow-up questions to better understand their needs

**Your Communication Style:**
- Write like you're having a casual conversation with a friend
- Use contractions (you're, we're, it's, etc.)
- Include conversational phrases like "That's a great question!", "Let me break this down for you", "Here's the thing..."
- Acknowledge their questions with phrases like "I'm glad you asked about that" or "That's an interesting point"
- Use emojis sparingly but naturally when it fits the tone
- Be encouraging and positive

**Response Length:**
- ${responseLength === 'short' ? 'Keep it brief and punchy - get straight to the point' : responseLength === 'long' ? 'Take your time to explain thoroughly with examples and context' : 'Find the sweet spot - informative but not overwhelming'}

**Ritual Network Knowledge:**
Here's the comprehensive information about Ritual Network:
${context}

Use this knowledge to give accurate, helpful answers about Ritual Network. Always respond confidently and knowledgeably about our platform, technology, and community.

**Remember**: You're not just an AI assistant - you're a gateway to understanding the future of decentralized AI. Be helpful, accurate, and conversational while showcasing Ritual Network's revolutionary potential.`

    const userPrompt = `User question: ${message}

Context:
${context}

Write a helpful, conversational response about Ritual Network. If the user is asking about something specific, provide detailed information. If they're just exploring, give them an engaging overview and ask follow-up questions.`

    const completion = await client.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: responseLength === 'short' ? 500 : responseLength === 'long' ? 1500 : 1000,
      temperature: 0.7,
      stream: true,
    })

    // Create streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        let buffer = ''
        let lastFlush = Date.now()
        
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              buffer += content
              
              // Flush buffer every 50ms or when buffer gets large
              const now = Date.now()
              if (now - lastFlush > 50 || buffer.length > 20) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: buffer, pineconeStatus })}\n\n`))
                buffer = ''
                lastFlush = now
              }
            }
          }
          
          // Flush any remaining buffer
          if (buffer) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: buffer, pineconeStatus })}\n\n`))
          }
          
          // Send completion signal
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, fullResponse, pineconeStatus })}\n\n`))
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    // Provide a fallback response for any errors
    const errorResponse = `Oops! 😅 I'm having a bit of trouble right now, but don't worry - I can still help you learn about Ritual Network!

Ritual Network is this awesome decentralized AI infrastructure platform that's making AI more accessible and private. Here's where you can learn more:

• **Website**: https://ritual.net
• **Discord**: https://discord.gg/HCGFMRGbkW (great community!)
• **Twitter**: https://twitter.com/ritualnet
• **FAQ**: https://ritual.academy/ritual/faqs/

Try asking me again in a moment, or check out those links for more info!`

    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: errorResponse, pineconeStatus: 'error' })}\n\n`))
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, fullResponse: errorResponse, pineconeStatus: 'error' })}\n\n`))
          controller.close()
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    )
  }
}
