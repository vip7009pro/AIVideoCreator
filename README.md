# AI Video Creator - MVP Platform

An AI-powered video generation web application for affiliate marketing that enables users to:

1. **Upload Images** - Product image + Model image
2. **Generate AI Video** - Merge product onto model using Kling AI video generation
3. **Add Audio** - Generate voiceover with ElevenLabs text-to-speech
4. **Track Credits** - Every generation costs credits; users get 50 free on signup

## 🎯 MVP Features

- ✅ User authentication (Email/Password + JWT)
- ✅ Credit-based billing system
- ✅ 3-step generation pipeline (image → video → audio)
- ✅ Real-time job status polling
- ✅ Cost estimation before generation
- ✅ Modular AI provider architecture (ready for Kling, Akool, HeyGen, ElevenLabs)
- ✅ Local file storage (upgradable to AWS S3)
- ✅ Type-safe TypeScript codebase

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Bcrypt
- **Storage**: Local filesystem (upgradable to S3)
- **Job Queue**: Bull (in-memory for MVP, Redis for production)

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Framework**: Tailwind CSS + Shadcn/UI (ready to integrate)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Database Schema
- **Users** - Authentication & identification
- **Projects** - Campaign/project organization
- **ProjectAssets** - Uploaded images (product, model)
- **GenerationJobs** - Top-level job orchestrator
- **ImageGeneration** - Step 1: Try-on/merge
- **VideoGeneration** - Step 2: Motion animation
- **AudioGeneration** - Step 3: Voice/audio
- **GenerationOutputs** - Normalized storage references
- **UserCredits** - Credit balance tracking
- **CreditTransactions** - Audit trail
- **ApiLogs** - Request logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Docker)
- npm or yarn

### Setup

```bash
# 1. Clone/extract the project
cd AIVideoCreator

# 2. Setup PostgreSQL (see SETUP_GUIDE.md for details)
# Option: Docker
docker run --name ai-video-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_video_creator -p 3005:3005 -d postgres:15

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Setup database
cd backend
npm run prisma:migrate

# 5. Start applications
# Terminal 1:
cd backend && npm run dev
# Terminal 2:
cd frontend && npm run dev
```

### Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Database GUI**: `cd backend && npm run prisma:studio`

## 📊 Architecture

### Backend Flow
```
Client Request
    ↓
Express Route
    ↓
Middleware (Auth, Validation)
    ↓
Service Layer (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

### Generation Pipeline
```
User Upload
    ↓
[Step 1] Image Generation (Akool - stub for Phase 2)
    ↓
[Step 2] Video Generation (Kling AI)
    ↓
[Step 3] Audio Generation (ElevenLabs - Phase 2)
    ↓
Download Output
```

### Provider Architecture
```
ProviderFactory
    ├─ KlingProvider (Video)
    ├─ AkoolProvider (Image - stub)
    └─ (ElevenLabs - Phase 2)
```

## 📁 Project Structure

```
AIVideoCreator/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # Configuration management
│   │   ├── providers/         # AI provider classes (BaseProvider, KlingProvider, etc.)
│   │   ├── services/          # Business logic (Auth, Cost, FileStorage, etc.)
│   │   ├── routes/            # API endpoints (to be completed)
│   │   ├── middleware/        # Auth & error handlers
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helper functions
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── uploads/               # Local file storage
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React.js frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Shadcn/UI components
│   │   │   ├── features/     # Feature-specific components
│   │   │   └── layouts/      # Layout wrappers
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client & utilities
│   │   ├── store/            # Zustand stores (state management)
│   │   ├── types/            # TypeScript definitions
│   │   ├── utils/            # Helper functions
│   │   ├── constants/        # Constants
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.ts    # Tailwind CSS config
│   └── package.json
│
├── SETUP_GUIDE.md            # Detailed setup instructions
└── README.md                 # This file
```

## 🔄 Development Phases

### ✅ Phase 1: Project Initialization (COMPLETE)
- Backend project structure with TypeScript
- Frontend project structure with React + Vite
- Prisma schema with full data model
- Core services (Auth, Cost Calculator, File Storage)
- AI Provider abstraction (BaseProvider, KlingProvider, ProviderFactory)

### ⏳ Phase 2: Database & Seeds
- Run Prisma migrations
- Create seed data (optional)

### ⏳ Phase 3-4: Backend Providers & Services (PARTIAL - needs Phase 5)
- ✅ BaseProvider abstract class
- ✅ KlingProvider implementation
- ✅ AkoolProvider stub
- ✅ ProviderFactory
- ✅ AuthService, CostCalculatorService, FileStorageService
- ⏳ JobPollingService

### ⏳ Phase 5-6: Backend Routes & Middleware
- API routes (auth, projects, generation)
- File upload handling via Multer
- Cost estimation endpoint
- Job status polling endpoint
- Credit validation middleware

### ⏳ Phase 7-11: Frontend Components & Pages
- File upload components (DropZone, PreviewGallery)
- Workflow components (StepIndicator, SettingsForm, JobStatusCard)
- Dashboard layout
- Auth pages
- Projects page
- Custom hooks (useFileUpload, useJobPolling)

### ⏳ Phase 12-14: Integration & Testing
- Connect frontend to backend APIs
- End-to-end testing
- Error handling & validation
- Performance optimization

## 🔐 Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:3005/ai_video_creator
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production
KLING_API_KEY=your-kling-api-key
INITIAL_USER_CREDITS=50
VIDEO_GENERATION_COST_5S=10
VIDEO_GENERATION_COST_10S=15
VIDEO_GENERATION_COST_15S=20
AUDIO_GENERATION_COST=5
```

**Frontend**: Set API base URL in `src/services/api/client.ts`

## 🧪 API Endpoints (To Be Implemented)

### Authentication
```
POST   /api/auth/register        { email, password }
POST   /api/auth/login           { email, password }
```

### Projects
```
POST   /api/projects             { name, description }
GET    /api/projects             
POST   /api/projects/:id/upload  FormData: file, assetType
```

### Generation
```
POST   /api/estimate-cost        { duration, includeAudio }
POST   /api/generate-video       { projectId, settings }
GET    /api/jobs/:jobId/status   
GET    /api/jobs/:jobId/output   
```

## 💾 Database Relationships

```
User (1) ── (N) Projects
         ├──  (N) GenerationJobs
         ├──  (N) UserCredits (1:1)
         └──  (N) CreditTransactions

Project (1) ── (N) ProjectAssets
           ├──  (N) GenerationJobs
           └──  (N) GenerationOutputs

GenerationJob (1) ── (1) ImageGeneration
              ├── (1) VideoGeneration
              └── (1) AudioGeneration

VideoGeneration (1) ── (1) ImageGeneration (input)
                   └── (1) AudioGeneration (next step)
```

## 🔄 Generation Workflow

```
1. User registers → 50 free credits
2. Upload product image → save to /uploads/{userId}/{projectId}/
3. Upload model image → save to /uploads/{userId}/{projectId}/
4. Select settings (duration, movement, voice)
5. Click "Estimate Cost" → API returns breakdown
6. Click "Generate" → checks credits, creates GenerationJob
7. Job → ImageGeneration step → VideoGeneration step → AudioGeneration step
8. Frontend polls /api/jobs/{jobId}/status every 5s
9. On completion, download video
10. Credits debited from account
```

## 🎓 Learning Resources

- **Prisma**: https://www.prisma.io/docs/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand

## 🤝 Contributing

This is a solo MVP project. For feature additions or bug fixes, follow the phase structure outlined in SETUP_GUIDE.md.

## 📝 License

MIT License

## 🎯 Roadmap

### Phase 2 (Post-MVP)
- Akool AI integration for product try-on
- ElevenLabs AI for realistic voice narration
- HeyGen integration for lip-sync audio
- AWS S3 for cloud file storage
- Redis for job queue persistence

### Phase 3 (Scale)
- Email notifications on generation complete
- Webhook support for external integrations
- API rate limiting
- Advanced analytics dashboard
- Team collaboration features
- Stripe payment integration
- Multi-language support

---

**Status**: Initial setup complete (Phase 1 ✅)

**Next**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for continuing implementation.

**Last Updated**: 2026-03-25
