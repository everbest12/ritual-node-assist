import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  
  return openaiClient
}
