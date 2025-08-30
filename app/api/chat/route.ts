import { NextRequest, NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Initialize Pinecone
let pinecone: Pinecone | null = null
try {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  })
} catch (error) {
  console.error('Failed to initialize Pinecone:', error)
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let context = ''
    
    // Try to get context from Pinecone if available
    if (pinecone) {
      try {
        // Step 1: Embed the user message
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: message,
        })

        const embedding = embeddingResponse.data[0].embedding

        // Step 2: Query Pinecone with the embedding
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)
        const queryResponse = await index.query({
          vector: embedding,
          topK: 5,
          includeMetadata: true,
        })

        // Step 3: Extract relevant context from Pinecone results
        context = queryResponse.matches
          ?.map(match => match.metadata?.text || '')
          .filter(text => typeof text === 'string' && text.length > 0)
          .join('\n\n') || ''
      } catch (pineconeError) {
        console.error('Pinecone error:', pineconeError)
        // Continue without Pinecone context
      }
    }

    // Step 4: Create the prompt for GPT-4
    const systemPrompt = `You are a helpful assistant for Ritual Network. You have access to relevant information from the Ritual Network knowledge base. 

Your task is to provide step-by-step, comprehensive answers to user questions about Ritual Network. Always structure your responses in a clear, organized manner with numbered steps when appropriate.

${context ? `Use the following context to answer the user's question:
${context}` : 'Since I don\'t have access to the specific knowledge base right now, I\'ll provide general information about Ritual Network based on my training data.'}

If the context doesn't contain enough information to answer the question completely, acknowledge what you know and suggest where they might find more information.

Always be helpful, accurate, and provide actionable information when possible.`

    const userPrompt = `User Question: ${message}

Please provide a step-by-step answer based on the available context.`

    // Step 5: Get response from GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
