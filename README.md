# Ritual Network Chatbot

A full-stack Next.js chatbot application that provides step-by-step answers about Ritual Network using AI-powered search and synthesis.

## 🚀 Features

- **Real-time Chat Interface**: Modern, responsive chat UI with message bubbles
- **AI-Powered Search**: Uses Pinecone vector database for semantic search
- **Step-by-Step Answers**: GPT-4o generates structured, comprehensive responses
- **Beautiful Design**: Gradient background (green to black) with glassmorphism effects
- **Social Links**: Quick access to Twitter, Discord, and FAQ

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Vector Database**: Pinecone
- **AI Model**: OpenAI GPT-4o + text-embedding-3-small
- **Backend**: Next.js API Routes

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Pinecone account and API key
- OpenAI API key

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ritual-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_pinecone_index_name
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ritual-chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── components/
│   │   ├── ChatInterface.tsx     # Main chat component
│   │   ├── MessageBubble.tsx     # Individual message component
│   │   └── SocialLinks.tsx       # Social media links
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🔄 How It Works

1. **User Input**: User types a message in the chat interface
2. **Embedding**: The message is embedded using OpenAI's text-embedding-3-small model
3. **Vector Search**: Pinecone searches for the top 5 most similar documents
4. **Context Retrieval**: Relevant context is extracted from Pinecone results
5. **AI Synthesis**: GPT-4o generates a step-by-step answer using the retrieved context
6. **Response**: The synthesized answer is returned to the chat interface

## 🎨 UI Features

- **Gradient Background**: Green to black gradient for a modern look
- **Glassmorphism**: Semi-transparent chat interface with backdrop blur
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Fade-in effects for messages and hover states
- **Loading States**: Animated dots while processing requests

## 🔗 Social Links

The application includes quick access to:
- **Twitter**: [@ritualnet](https://twitter.com/ritualnet)
- **Discord**: [Ritual Network Discord](https://discord.gg/HCGFMRGbkW)
- **FAQ**: [Ritual Academy FAQs](https://ritual.academy/ritual/faqs/)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Configuration

### Pinecone Setup

1. Create a Pinecone account at [pinecone.io](https://pinecone.io)
2. Create a new index with appropriate dimensions (1536 for text-embedding-3-small)
3. Add your API key to environment variables

### OpenAI Setup

1. Create an OpenAI account at [openai.com](https://openai.com)
2. Generate an API key
3. Add your API key to environment variables

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please reach out through:
- [Discord](https://discord.gg/HCGFMRGbkW)
- [Twitter](https://twitter.com/ritualnet)
- [FAQ](https://ritual.academy/ritual/faqs/)
