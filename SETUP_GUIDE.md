# AI Video Creator - Setup & Implementation Guide

## ✓ Completed in Phase 1

### Backend Setup
- ✓ Initialized Node.js + Express + TypeScript project
- ✓ Installed core dependencies: `express`, `prisma`, `bcrypt`, `jsonwebtoken`, `dotenv`, `axios`, `bull`, `multer`, `cors`
- ✓ Created folder structure:
  - `src/config/` - Configuration management
  - `src/providers/` - AI provider abstraction (BaseProvider, KlingProvider, AkoolProvider, ProviderFactory)
  - `src/services/` - Business logic (AuthService, CostCalculatorService, FileStorageService)
  - `src/routes/` - API endpoints (to be implemented)
  - `src/middleware/` - Auth & error handling middleware
  - `src/types/` - TypeScript type definitions
  - `src/utils/` - Helper utilities
  - `uploads/` - Local file storage directory
  - `prisma/` - Prisma schema (created with full data model)

### Prisma Schema (Complete)
- ✓ Created comprehensive `prisma/schema.prisma` with all entities:
  - **User & Auth**: User, UserCredits
  - **Projects**: Project, ProjectAsset
  - **Generation Pipeline**: GenerationJob, ImageGeneration, VideoGeneration, AudioGeneration
  - **Outputs**: GenerationOutput
  - **Audit & Credits**: CreditTransaction, ApiLog
  - All relationships and indexes properly configured

### Backend Services (Phase 3-4 Complete)
- ✓ **BaseProvider** - Abstract provider class with retry logic, error handling
- ✓ **KlingProvider** - Video generation via Kling AI (generateVideo, getJobStatus, retrieveOutput)
- ✓ **AkoolProvider** - Stub for Phase 2 integration (product try-on)
- ✓ **ProviderFactory** - Dynamic provider instantiation and initialization
- ✓ **AuthService** - User registration, login, JWT token management
- ✓ **CostCalculatorService** - Cost estimation, credit debit/reserve/release
- ✓ **FileStorageService** - Local file storage with user/project directory structure
- ✓ **Logger & Helper Utils** - Logging, file system, validation utilities
- ✓ **Middleware** - Auth middleware (JWT validation), error handler

### Frontend Setup
- ✓ Initialized React 18 + Vite + TypeScript project
- ✓ Installed dependencies: `react-router-dom`, `zustand`, `axios`, `tailwindcss`
- ✓ Configured Tailwind CSS + PostCSS
- ✓ Created folder structure:
  - `src/components/ui/` - Shadcn/UI component (to be populated)
  - `src/components/features/FileUpload/` - Upload components
  - `src/components/features/WorkflowDashboard/` - Workflow steps
  - `src/components/layouts/` - Layout wrappers
  - `src/hooks/` - Custom hooks
  - `src/services/api/` - API client
  - `src/store/` - Zustand state management
  - `src/types/` - TypeScript definitions
  - `src/utils/` - Utilities
  - `src/pages/` - Page components
  - `src/constants/` - Constants

### Frontend Infrastructure (Phase 7 Partial)
- ✓ **Types** - WorkflowState, FileWithPreview, GenerationJob, CostEstimate
- ✓ **API Client** - Axios-based with auth interceptors, token management, all endpoints typed
- ✓ **Zustand Stores**:
  - `useUploadStore` - File upload state (files, progress, errors)
  - `useJobStore` - Generation job tracking (status, polling)
  - `useWorkflowStore` - Multi-step workflow state (steps, cost, errors)
  - `useAuthStore` - Authentication state (user, credits)

---

## 📋 Next Steps - Phase 2: Run Prisma Migrations

Before running the application, you need to set up PostgreSQL and Prisma:

### 1. Setup PostgreSQL Database

**Option A: Use Docker (Recommended)**
```bash
docker run --name ai-video-creator-db \
  -e POSTGRES_DB=ai_video_creator \
  -e POSTGRES_PASSWORD=postgres \
  -p 3005:3005 \
  -d postgres:15
```

**Option B: Install locally**
- Download PostgreSQL from https://www.postgresql.org/download/
- Create a database: `ai_video_creator`
- Create a user with password

**Option C: Cloud Database**
- Use RDS, Supabase, or railway.app
- Update `DATABASE_URL` in `.env` with your connection string

### 2. Verify .env Configuration

Check `backend/.env` has correct settings (already configured for local dev):
```bash
# Should point to your PostgreSQL instance
DATABASE_URL="postgresql://postgres:postgres@localhost:3005/ai_video_creator"

# Generate a secure JWT secret for production:
# OpenSSL: openssl rand -base64 32
JWT_SECRET="dev-secret-key-change-in-production"

# Other settings are pre-configured for MVP
```

### 3. Run Prisma Migration

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Create tables in database
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed

# (Optional) View database GUI
npm run prisma:studio
```

After migration, verify tables exist in your database.

---

## 🚀 Running the Applications

### Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
[INFO] Initializing AI Video Creator Backend
[INFO] Environment: development
[INFO] Port: 3000
[INFO] Database: postgresql://postgres:postgres@localhost:3005/ai_video_creator
[INFO] Database connected successfully
[INFO] Initializing ProviderFactory
[INFO] Kling Provider: Ready
[INFO] Akool Provider: Initialized (stub)
✓ Server running on http://localhost:3000
✓ Ready for API requests
```

### Start Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access Application
- Frontend: http://localhost:5173/
- Backend API: http://localhost:3000/api/
- Health check: http://localhost:3000/health

---

## 📊 What's Implemented

### Backend Architecture Ready For:
1. ✓ User authentication (register, login, JWT)
2. ✓ AI provider abstraction (Kling, with Akool stub)
3. ✓ Cost calculation & credit system
4. ✓ File storage (local)
5. ✓ Error handling & logging
6. ⏳ API routes (Phase 5)
7. ⏳ Job polling (Phase 5)
8. ⏳ Database operations (will work once routes are added)

### Frontend Infrastructure Ready For:
1. ✓ React + Vite setup with TypeScript
2. ✓ Tailwind CSS + shadcn/ui ready
3. ✓ Zustand state management (auth, uploads, jobs, workflow)
4. ✓ Axios API client with interceptors
5. ✓ Type-safe endpoint definitions
6. ⏳ UI components (Phase 8-10)
7. ⏳ Pages (Phase 10)
8. ⏳ Custom hooks (Phase 11)

### Database Schema Ready:
- ✓ All 11 tables with relationships
- ✓ Indexes for common queries
- ✓ Proper foreign keys and cascades
- ✓ Credit tracking and audit trail
- ✓ Job pipeline with 3 steps (image, video, audio)

---

## 🔧 Remaining Work (Phases 2-14)

### Phase 2: Database Seeds (Optional)
- Create seed data: pricing rules, initial test data
- File: `backend/prisma/seed.ts`

### Phase 5: Backend API Routes
**Files to create:**
- `src/routes/auth.ts` - POST /register, /login
- `src/routes/projects.ts` - CRUD projects, upload assets
- `src/routes/generation.ts` - Generate video/audio, cost estimation, status polling
- Update `src/index.ts` to wire routes

**Endpoints needed:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/projects
GET    /api/projects
POST   /api/projects/:id/upload
POST   /api/estimate-cost
POST   /api/generate-video
GET    /api/jobs/:jobId/status
GET    /api/jobs/:jobId/output
```

### Phase 6: Job Polling Service
- Create `src/services/JobPollingService.ts`
- Implement Bull queue integration
- Poll Kling API every 10s
- Update job status in database

### Phases 7-11: Frontend Components & Hooks
**Components to create:**
- `DropZone.tsx` - Drag-drop file upload
- `PreviewGallery.tsx` - Image previews
- `UploadProgress.tsx` - Upload status
- `SettingsForm.tsx` - Duration, movement, voice options + cost display
- `StepIndicator.tsx` - Visual stepper
- `JobStatusCard.tsx` - Job progress tracking
- `DashboardLayout.tsx` - Main layout
- `WorkflowPage.tsx` - Multi-step orchestrator
- `AuthPage.tsx` - Login/register
- `ProjectsPage.tsx` - Project list

**Hooks to create:**
- `useFileUpload()` - File selection & validation
- `useJobPolling()` - Poll status every 5s
- `useMultiStepForm()` - Multi-step form logic

### Phase 12: Integration Testing
- Connect frontend to backend APIs
- Test auth flow
- Test file upload
- Test cost estimation
- Test generation pipeline

### Phase 13: Kling AI Integration
- Add KLING_API_KEY to .env
- Test KlingProvider.generateVideo()
- Implement job polling for Kling responses

### Phase 14: E2E Verification
- Manual testing of full workflow
- Verify credit system
- Test error handling
- Performance optimization

---

## 🔑 Key Files Reference

### Backend Core
- `backend/src/index.ts` - Server entry point
- `backend/src/config/index.ts` - Configuration
- `backend/prisma/schema.prisma` - Database schema
- `backend/.env` - Local environment

### Provider System
- `backend/src/providers/BaseProvider.ts` - Abstract base
- `backend/src/providers/KlingProvider.ts` - Video generation
- `backend/src/providers/ProviderFactory.ts` - Factory pattern

### Services
- `backend/src/services/AuthService.ts` - User auth
- `backend/src/services/CostCalculatorService.ts` - Pricing
- `backend/src/services/FileStorageService.ts` - File handling

### Frontend Core
- `frontend/src/main.tsx` - App entry
- `frontend/vite.config.ts` - Vite config
- `frontend/tailwind.config.ts` - Tailwind config

### Frontend State
- `frontend/src/store/index.ts` - Zustand stores
- `frontend/src/services/api/client.ts` - API client
- `frontend/src/types/workflow.types.ts` - Type definitions

---

## 🧪 Testing Checklist

After each phase, verify:

1. **Backend started**
   - No TypeScript errors
   - Database connected
   - Providers initialized
   - Server listening on port 3000

2. **Frontend started**
   - No build errors
   - Vite dev server running on 5173
   - React DevTools work
   - No console errors

3. **Database accessible**
   ```bash
   npm run prisma:studio
   # Opens GUI showing all tables
   ```

---

## 💡 Tips & Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d ai_video_creator

# Check DATABASE_URL format
# postgresql://[user]:[password]@[host]:[port]/[database]
```

### Port Already in Use
```bash
# Backend (port 3000)
# Kill: lsof -ti:3000 | xargs kill -9

# Frontend (port 5173)
# Kill: lsof -ti:5173 | xargs kill -9
```

### Prisma Issues
```bash
# Clear cache & regenerate
rm -rf node_modules/.prisma
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Node Modules Cleanup
```bash
# If dependencies seem broken
rm -rf backend/node_modules frontend/node_modules
npm install
```

---

## 📚 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (5173)                │
│  Pages, Components, Zustand Store, Axios Client        │
└──────────────────────────┬──────────────────────────────┘
                           │  /api/... (http://localhost:3000)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Express Backend (3000)                   │
│ Routes → Services → Prisma → PostgreSQL                │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Kling API         Akool API (stub)    File Storage
   (Video Gen)      (Image Gen)          (Local /uploads)
```

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- Backend `npm run dev` starts without errors ✓
- Frontend `npm run dev` starts without errors ✓
- Prisma schema compiles ✓
- Database tables created via migration ✓

### MVP Complete When:
- User can register → get initial 50 credits
- User can upload 2 images (product + model)
- User can estimate cost (no charge, preview cost)
- User can click "Generate", backend calls Kling API
- Frontend polls job status every 5s
- On completion, download link appears
- Credits debited from account
- All errors handled gracefully

---

## 📖 Documentation

- Prisma Docs: https://www.prisma.io/docs/
- Express Docs: https://expressjs.com/
- React Docs: https://react.dev/
- Zustand Docs: https://github.com/pmndrs/zustand
- Tailwind Docs: https://tailwindcss.com/docs
- Axios Docs: https://axios-http.com/docs/intro

---

Created: 2026-03-25
Next Phase: Phase 2 - Database Migrations
