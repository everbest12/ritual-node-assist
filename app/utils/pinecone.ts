import { Pinecone } from '@pinecone-database/pinecone'

let pineconeClient: Pinecone | null = null

export function getPineconeClient() {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
      throw new Error('Pinecone credentials not configured')
    }
    
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    })
  }
  
  return pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'discord-qa-voyage')
}
