# AgentX - AI-Powered HR Digital Assistant

> **Intelligent Digital Assistant for Saudi Arabia's Ministry of Human Resources and Social Development (HRSD)**

AgentX is a comprehensive AI-powered platform built with Next.js 15, Supabase, and OpenAI, designed to streamline HR services and labor-related operations in Saudi Arabia. It features an autonomous AI agent, voice capabilities, proactive event detection, and a complete Qiwa platform integration.

---

## 🚀 Features

### Core Capabilities
- **🤖 Autonomous AI Agent**: Tool-driven, context-aware assistant with reasoning capabilities
- **🎤 Voice Interaction**: Speech-to-Text (OpenAI Whisper) and Text-to-Speech (ElevenLabs)
- **📊 Proactive Event Engine**: Rule-based triggers and ML-powered need prediction
- **🔄 RAG Integration**: Context-aware responses using work regulations and service descriptions
- **🎯 User Behavior Learning**: Adapts to user patterns and preferences over time

### Qiwa Platform Services
- **Employment Contracts**: View, manage, renew, and track contracts
- **Certificates**: Generate salary definitions, service certificates, and labor licenses
- **Resume/CV Management**: Create, update, add courses, and share resumes
- **Tickets**: Create, track, and manage support tickets
- **Appointments**: Schedule, cancel, and manage labor office appointments
- **Domestic Labor**: Request and track domestic worker services
- **Work Regulations**: Search and browse Saudi labor laws with RAG

### AI Tools & Actions
The agent can execute 15+ specialized tools including:
- Contract renewal and updates
- Certificate generation
- Resume updates and course additions
- Ticket creation and status checks
- Appointment scheduling
- Domestic labor requests
- User need prediction
- Feedback recording
- Proactive event creation

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI/ML**: OpenAI GPT-4, Langchain, OpenAI Whisper, ElevenLabs TTS
- **Database**: Supabase (13 tables with relationships)
- **Styling**: Tailwind CSS with custom Qiwa branding
- **Icons**: Heroicons (professional SVG icons)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- ElevenLabs API key (for TTS)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaifAlotaibie/AgentX.git
   cd AgentX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # ElevenLabs (optional, for TTS)
   ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Go to your Supabase project SQL Editor
   - Run the SQL script from `database-schema.sql`
   - This will create all 13 required tables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 📂 Project Structure

```
AgentX/
├── app/
│   ├── ai/                     # AI Agent System
│   │   ├── agent/             # Agent executor and system prompt
│   │   ├── tools/             # 15+ AI tools for actions
│   │   └── proactive/         # Proactive event engine
│   ├── api/                   # API Routes
│   │   ├── chat/             # Main chat endpoint
│   │   ├── qiwa/             # Qiwa services APIs
│   │   ├── voice/            # Voice interaction
│   │   └── tts/              # Text-to-speech
│   ├── qiwa/                  # Qiwa Platform Pages
│   │   ├── individuals/      # Services dashboard
│   │   │   ├── chatbot/     # AI Chatbot page
│   │   │   ├── contracts/   # Employment contracts
│   │   │   ├── certificates/# Certificate generator
│   │   │   ├── resume/      # CV manager
│   │   │   ├── tickets/     # Support tickets
│   │   │   ├── appointments/# Appointments
│   │   │   ├── domestic/    # Domestic labor
│   │   │   └── regulations/ # Work regulations
│   │   └── page.tsx          # Qiwa landing page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # HRSD homepage
├── components/
│   ├── qiwa/                  # Qiwa-specific components
│   │   ├── QiwaSidebar.tsx   # Navigation sidebar
│   │   ├── QiwaIcon.tsx      # Icon system
│   │   └── ...               # Other components
│   └── ...                    # Main website components
├── lib/
│   ├── db/                    # Database layer
│   │   ├── db.ts             # Supabase client & helpers
│   │   └── types.ts          # TypeScript interfaces
│   └── supabase.ts           # User management
├── services/                  # Legacy services (being deprecated)
├── data/                      # RAG data & service definitions
├── public/                    # Static assets
├── database-schema.sql        # Database setup script
└── package.json
```

---

## 🗄 Database Schema

The project uses **13 interconnected tables**:

| Table | Purpose |
|-------|---------|
| `user_profile` | User account information |
| `employment_contracts` | Employment contracts data |
| `work_regulations` | Saudi labor law articles |
| `domestic_labor_requests` | Domestic worker requests |
| `certificates` | Generated certificates |
| `resumes` | User CVs and experience |
| `resume_courses` | Training courses for CVs |
| `labor_appointments` | Office appointments |
| `agent_actions_log` | AI agent action history |
| `conversations` | Chat conversation logs |
| `user_behavior` | Learning and prediction data |
| `tickets` | Support ticket system |
| `proactive_events` | Proactive alerts and events |

See `database-schema.sql` for full schema details.

---

## 🤖 AI Agent System

The AI agent is built with **tool-based architecture**:

### Agent Flow
1. User sends a message
2. Agent analyzes intent and context
3. Agent selects appropriate tools
4. Tools execute actions (DB operations, API calls)
5. Results are logged and returned
6. Agent generates a natural language response
7. Proactive events are detected and triggered

### Key Rules (CV Example)
- **Always fetch existing data first** before asking user
- **Auto-create tickets** for all agent actions
- **Only use supported fields** (no hallucinated data)
- **Log every action** to `agent_actions_log`
- **Update user behavior** for learning
- **Use RAG** for regulations and general inquiries

---

## 🎨 Qiwa Branding

The Qiwa platform follows official branding guidelines:

### Colors
```css
--qiwa-primary: #20183b (Dark Purple)
--qiwa-blue: #0060ff (Primary Blue)
--qiwa-text: #4b515a (Text Gray)
--qiwa-bg: #fafafa (Background)
```

### Typography
- **Arabic**: "Noto Kufi Arabic", sans-serif
- **English**: "Inter", sans-serif

### Logo
- Logo file: `public/qiwalogofor-afrad.png`
- Used across all Qiwa pages

---

## 🔐 Security Notes

- ✅ All API keys are in `.env.local` (not committed)
- ✅ UUID validation on all user operations
- ✅ Supabase Row Level Security enabled
- ✅ No sensitive data in codebase
- ✅ Input validation on all endpoints
- ⚠️ **Before pushing to GitHub**: Double-check `.env.local` is in `.gitignore`

---

## 📝 Development Notes

### Build & Deploy
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Key Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS with Qiwa colors
- `tsconfig.json` - TypeScript compiler options
- `.gitignore` - Excluded files (includes `.env.local`)

### Environment Requirements
- Node.js 18+
- TypeScript 5.9+
- Next.js 15.1+
- Supabase v2

---

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Voice features are experimental
- Some UI pages need backend integration (in progress)
- Proactive engine uses basic rules (ML models coming soon)
- RAG dataset needs expansion

### Planned Features
- [ ] Advanced ML-based need prediction
- [ ] Multi-language support (English + Arabic)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Document upload for certificates
- [ ] E-signature integration

---

## 🤝 Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Wait for review

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Saif Alotaibie**
- GitHub: [@SaifAlotaibie](https://github.com/SaifAlotaibie)

---

## 🙏 Acknowledgments

- Saudi Ministry of Human Resources and Social Development (HRSD)
- Qiwa Platform
- OpenAI for GPT-4 and Whisper
- Supabase team
- Next.js team

---

**Made with ❤️ for Saudi Arabia's digital transformation**
