import { NextRequest, NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Initialize Pinecone with better error handling
let pinecone: Pinecone | null = null
let pineconeInitialized = false

try {
  if (process.env.PINECONE_API_KEY && process.env.PINECONE_ENVIRONMENT && process.env.PINECONE_INDEX_NAME) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    })
    pineconeInitialized = true
    console.log('Pinecone initialized successfully')
    console.log('Environment:', process.env.PINECONE_ENVIRONMENT)
    console.log('Index:', process.env.PINECONE_INDEX_NAME)
  } else {
    console.log('Pinecone credentials not found, running without knowledge base')
    console.log('API Key:', !!process.env.PINECONE_API_KEY)
    console.log('Environment:', process.env.PINECONE_ENVIRONMENT)
    console.log('Index:', process.env.PINECONE_INDEX_NAME)
  }
} catch (error) {
  console.error('Failed to initialize Pinecone:', error)
  pineconeInitialized = false
}

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
    const { message, settings } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
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

    let context = ''
    let pineconeStatus = 'unavailable'
    
    // Try to get context from Pinecone if available
    if (pinecone && pineconeInitialized) {
      try {
        console.log('Attempting to query Pinecone...')
        
        // Step 1: Embed the user message
        const embeddingResponse = await getOpenAI().embeddings.create({
          model: 'text-embedding-3-small',
          input: message,
        })

        const embedding = embeddingResponse.data[0].embedding
        console.log('Embedding created successfully')

        // Step 2: Query Pinecone with the embedding
        const indexName = process.env.PINECONE_INDEX_NAME!
        console.log('Querying index:', indexName)
        
        const index = pinecone.index(indexName)
        const queryResponse = await index.query({
          vector: embedding,
          topK: 5,
          includeMetadata: true,
        })

        // Step 3: Extract relevant context from Pinecone results
        if (queryResponse.matches && queryResponse.matches.length > 0) {
          context = queryResponse.matches
            ?.map(match => match.metadata?.text || '')
            .filter(text => typeof text === 'string' && text.length > 0)
            .join('\n\n') || ''
          
          pineconeStatus = 'connected'
          console.log('Successfully retrieved context from Pinecone')
          console.log('Found', queryResponse.matches.length, 'matches')
        } else {
          pineconeStatus = 'no_results'
          console.log('No results found in Pinecone')
        }
      } catch (pineconeError) {
        console.error('Pinecone error:', pineconeError)
        pineconeStatus = 'error'
        
        // Log specific error details
        if (pineconeError instanceof Error) {
          console.error('Error message:', pineconeError.message)
          console.error('Error name:', pineconeError.name)
        }
        
        // Continue without Pinecone context
      }
    } else {
      console.log('Pinecone not available, using general knowledge')
      pineconeStatus = 'unavailable'
    }

    // Always provide comprehensive Ritual Network context
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

    // Determine response length based on settings
    const responseLength = settings?.responseLength || 'medium'
    const maxTokens = responseLength === 'short' ? 500 : responseLength === 'long' ? 1500 : 1000

    // Determine AI model based on settings
    const aiModel = settings?.aiModel || 'gpt-4o'

    // Step 4: Create the prompt for GPT-4
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

    const userPrompt = `User: ${message}

Please respond in a friendly, conversational way - like you're chatting with a friend who's curious about Ritual Network.`

    // Step 5: Get streaming response from GPT-4 with optimized settings
    const stream = await getOpenAI().chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: true,
      // Optimize for faster response
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    // Create an optimized readable stream with buffering
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        let buffer = ''
        let lastFlush = Date.now()
        
        try {
          for await (const chunk of stream) {
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
