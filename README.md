# 🔮 Ritual AI Chatbot

A full-stack Next.js chatbot powered by Ritual Network's decentralized AI infrastructure. Features conversational AI, session management, and advanced UI/UX.

## 🚀 Live Demo

[Deploy your own instance on Vercel](#deployment)

## ✨ Features

- **🤖 Conversational AI** - Powered by GPT-4o with Ritual Network knowledge
- **💬 Session Management** - Save and manage multiple chat sessions
- **🎨 Modern UI/UX** - Glassmorphism design with dark/light themes
- **📱 Mobile Responsive** - Works perfectly on all devices
- **⚡ Real-time Streaming** - Fast, responsive AI responses
- **🔍 Search & Filter** - Find messages quickly
- **📊 Analytics Dashboard** - Track your chat usage
- **⚙️ Settings Panel** - Customize your experience
- **📤 Export Functionality** - Save your conversations
- **🎯 Smart Suggestions** - AI-powered conversation starters

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o
- **Vector DB**: Pinecone (with fallback)
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Pinecone API key (optional - has fallback)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/everbest12/ritual-node-assist.git
   cd ritual-node-assist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=your_pinecone_index_name
   PINECONE_ENVIRONMENT=us-east1-gcp
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add PINECONE_API_KEY
   vercel env add PINECONE_INDEX_NAME
   vercel env add PINECONE_ENVIRONMENT
   ```

#### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure environment variables**
   In the Vercel dashboard, go to your project settings:
   - **Environment Variables** → Add the following:
     - `OPENAI_API_KEY` = your OpenAI API key
     - `PINECONE_API_KEY` = your Pinecone API key
     - `PINECONE_INDEX_NAME` = your Pinecone index name
     - `PINECONE_ENVIRONMENT` = us-east1-gcp

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `PINECONE_API_KEY` | Your Pinecone API key | ❌ No (has fallback) |
| `PINECONE_INDEX_NAME` | Your Pinecone index name | ❌ No (has fallback) |
| `PINECONE_ENVIRONMENT` | Pinecone environment | ❌ No (has fallback) |

### Important Notes for Deployment

1. **API Key Security**: Never commit API keys to your repository
2. **Fallback System**: The app works even without Pinecone (uses built-in knowledge)
3. **Function Timeouts**: API routes are configured for 60-second timeouts
4. **Region**: Deployed to US East (iad1) for optimal performance

## 🔧 Configuration

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your environment variables

### Pinecone Setup (Optional)

1. Create a Pinecone account at [pinecone.io](https://pinecone.io)
2. Create an index with dimension 1536 (for text-embedding-3-small)
3. Get your API key and index name
4. Add to environment variables

## 🎯 Features in Detail

### Chat Interface
- Real-time streaming responses
- Message reactions (like/dislike)
- Copy to clipboard functionality
- Rich media support (images, code blocks)

### Session Management
- Multiple chat sessions
- AI-generated session titles
- Session export (Markdown format)
- Session switching

### Settings & Customization
- Dark/light theme toggle
- Response length control
- AI model selection
- Font size adjustment
- Language preferences

### Analytics
- Message count tracking
- Session statistics
- Usage patterns
- Performance metrics

## 🐛 Troubleshooting

### Common Issues

1. **"Knowledge base unavailable"**
   - This is normal if Pinecone is not configured
   - The app uses built-in knowledge as fallback

2. **Build errors on Vercel**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json

3. **API timeouts**
   - Increase function timeout in vercel.json if needed
   - Check OpenAI API key validity

4. **Pinecone connection errors**
   - Verify API key and environment settings
   - Check Pinecone service status

### Support

- **GitHub Issues**: [Create an issue](https://github.com/everbest12/ritual-node-assist/issues)
- **Discord**: [Join Ritual Network](https://discord.gg/HCGFMRGbkW)
- **Documentation**: [Ritual Academy](https://ritual.academy/ritual/faqs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ritual Network** - For the decentralized AI infrastructure vision
- **OpenAI** - For the powerful GPT models
- **Vercel** - For seamless deployment
- **Next.js Team** - For the amazing framework

---

**Built with ❤️ for the decentralized AI future**
