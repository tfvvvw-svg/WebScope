# WebScope - Professional Website Analysis Platform

Production-ready commercial SaaS platform for comprehensive website analysis with AI-powered insights.

## 🚀 Features

### Core Analysis
- **Technology Detection**: Frontend frameworks, backend technologies, CSS frameworks, build tools, analytics, CMS, and more
- **Security Audit**: SSL/TLS certificates, security headers (CSP, HSTS, X-Frame-Options), HTTPS validation
- **Performance Metrics**: Page size, request count, Lighthouse scores, Core Web Vitals
- **SEO Analysis**: Meta tags, Open Graph, Twitter Cards, structured data, canonical URLs, robots.txt
- **Design Analysis**: Color palette extraction, font detection, theme detection (dark/light), responsive design
- **Server Information**: DNS records, IP addresses, hosting providers, CDN detection, server software

### AI Assistant
- **Multi-Provider Support**: OpenAI GPT, Anthropic Claude, Google Gemini
- **Context-Aware**: Uses scan results as context for intelligent answers
- **Natural Conversations**: Supports follow-up questions and general queries
- **Markdown Support**: Code blocks, tables, formatted text
- **Session Memory**: Remembers conversation context

### User Experience
- **Dark Theme Only**: Professional, modern interface
- **Fully Responsive**: Optimized for desktop, tablet, and mobile
- **Real-time Progress**: Live scan progress with step indicators
- **Scan History**: Local storage with favorites and comparison
- **Report Comparison**: Side-by-side analysis of multiple scans

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── index.ts              # Express server setup
│   ├── routes/
│   │   ├── scan.ts           # Website scanning endpoint
│   │   └── ai.ts             # AI chat endpoint
│   └── services/
│       └── scanner.ts        # Core scanning logic
```

**Key Features:**
- Rate limiting (10 requests/minute per IP)
- CORS protection with configurable origins
- Helmet security headers
- Multi-proxy HTML fetching with fallback
- DNS, SSL, and technology detection
- Evidence-based detection with explanations

### Frontend (React + TypeScript + Vite)
```
src/
├── services/
│   ├── apiService.ts         # Backend API integration
│   ├── aiService.ts          # AI chat logic
│   └── scanner.ts            # Frontend scanner utilities
├── context/
│   └── AppContext.tsx         # Global state management
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── Dashboard.tsx          # Scan results dashboard
│   ├── AiChat.tsx             # AI assistant interface
│   ├── History.tsx            # Scan history
│   ├── Compare.tsx            # Report comparison
│   └── ...
└── types/
    └── scan.ts                # TypeScript interfaces
```

**Key Features:**
- React Router for navigation
- React Query for data fetching
- Framer Motion for animations
- Lucide React for icons
- Tailwind CSS for styling
- Lazy loading for performance

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- At least one AI API key (OpenAI, Anthropic, or Google)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/tfvvvw-svg/WebScope.git
cd WebScope
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# At least one AI provider key required
OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GOOGLE_AI_API_KEY=your_key_here

AI_PROVIDER=openai
```

5. **Build the frontend**
```bash
npm run build
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the application at `http://localhost:5173`

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 🔒 Security

- **Rate Limiting**: 10 requests per minute per IP
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js with CSP, HSTS, etc.
- **Input Validation**: URL format validation
- **No Secrets Exposure**: API keys only in environment variables
- **Error Handling**: Safe error messages without stack traces

## 🎯 Accuracy Principles

- **Evidence-Based Detection**: Every technology includes detection method
- **No Fabrication**: Only displays verified information
- **Transparent Methodology**: Clear explanations of how data was collected
- **Graceful Degradation**: Hides sections with no verified data
- **Cross-Checking**: Multiple detection methods where possible

### Example Detection Evidence:
- React — detected from JavaScript bundle
- Vercel — detected from HTTP headers (x-vercel-cache)
- Tailwind CSS — detected from generated utility classes
- Inter Font — detected from computed CSS

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3001 | Backend server port |
| `NODE_ENV` | No | development | Environment mode |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for CORS |
| `OPENAI_API_KEY` | Conditional* | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | Conditional* | - | Anthropic API key |
| `GOOGLE_AI_API_KEY` | Conditional* | - | Google AI API key |
| `AI_PROVIDER` | No | openai | Preferred AI provider |
| `RATE_LIMIT_WINDOW_MS` | No | 60000 | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | No | 10 | Max requests per window |

*At least one AI provider key is required for the AI assistant feature.

## 📊 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS
- **HTTP Client**: Axios
- **HTML Parsing**: Cheerio
- **AI SDKs**: OpenAI, Anthropic, Google Generative AI

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context + React Query
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## 🧪 Testing

### Build Verification
```bash
# Frontend build
npm run build

# Backend build
cd backend
npm run build
```

### Manual Testing Checklist
- [ ] URL scanning works correctly
- [ ] Technology detection is accurate
- [ ] SSL/TLS validation functions
- [ ] DNS records are retrieved
- [ ] Security headers are detected
- [ ] AI assistant responds to questions
- [ ] Scan history saves and loads
- [ ] Report comparison works
- [ ] Mobile responsiveness is functional
- [ ] Dark theme displays correctly

## 📝 API Documentation

### Scan Endpoint
```
POST /api/scan
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "domain": "example.com",
  "url": "https://example.com",
  "scanDate": "2026-07-14T12:00:00.000Z",
  "title": "Example Domain",
  "technologies": [
    {
      "name": "React",
      "evidence": "Detected from JavaScript bundle and DOM markers"
    }
  ],
  "fonts": ["Inter", "Roboto"],
  "colors": ["#6366f1", "#8b5cf6"],
  "ssl": {
    "valid": true,
    "issuer": "Let's Encrypt",
    "expires": "2026-10-14T12:00:00.000Z"
  },
  "dns": {
    "a": ["93.184.216.34"],
    "ns": ["ns1.example.com"]
  }
}
```

### AI Chat Endpoint
```
POST /api/ai/chat
Content-Type: application/json

{
  "question": "What technologies does this site use?",
  "history": [],
  "scanContext": { ... },
  "provider": "openai"
}
```

**Response:**
```json
{
  "answer": "Based on the scan results...",
  "provider": "openai",
  "timestamp": "2026-07-14T12:00:00.000Z"
}
```

## 🚢 Deployment

### Render Deployment

1. **Connect Repository**
   - Import project from GitHub
   - Select "WebScope" repository

2. **Configure Backend Service**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables from `.env.example`

3. **Configure Frontend Service**
   - Root Directory: `.`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add `VITE_API_URL` environment variable pointing to backend

4. **Deploy**
   - Click "Deploy"
   - Monitor build logs for errors

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.onrender.com
OPENAI_API_KEY=your_production_key
AI_PROVIDER=openai
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 🎨 UI/UX Improvements

### Dark Theme
- Consistent dark color scheme throughout
- High contrast for readability
- Reduced eye strain for long sessions
- Professional appearance

### Animations
- Smooth page transitions
- Loading state animations
- Hover effects on interactive elements
- Progress indicators for scans

### Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Adaptive layouts for all screen sizes
- Fast loading on mobile networks

## ⚡ Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Optimized assets in build
- **Caching**: React Query for data caching
- **Efficient Rendering**: Minimal re-renders with proper state management

## 🔍 Accuracy Improvements

### Multi-Method Detection
- HTML content analysis
- HTTP header inspection
- DNS record verification
- SSL certificate validation
- Multiple CORS proxies for reliability

### Evidence-Based Results
- Every detection includes explanation
- No fabricated or estimated data
- Clear indication when data is unavailable
- Cross-verification of findings

## 📈 Monitoring

### Health Checks
```
GET /health
GET /api/scan/health
GET /api/ai/health
```

### Logging
- Scan requests with timestamps
- Error tracking with context
- AI provider usage metrics
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ by the WebScope Team**