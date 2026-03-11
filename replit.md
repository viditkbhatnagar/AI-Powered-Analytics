# AI-Powered Analytics - Career Analytics Platform

## Overview

AI-Powered Analytics is an AI-powered career analytics and data visualization platform designed for UAE Supply Chain & Logistics professionals. The platform provides salary benchmarks, career domain exploration, and 30+ interactive visualizations competing with tools like Tableau and Power BI. It features a professional Microsoft Fluent Design aesthetic with comprehensive data visualization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand with persistence middleware for client-side state
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Charts**: Multi-library approach using Plotly.js, ECharts, and Recharts for different visualization types

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api/*` prefix
- **File Uploads**: Multer for handling multipart form data
- **AI Integration**: OpenAI API for data extraction from uploaded documents

### Database Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for database migrations stored in `/migrations`

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-based page components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and providers
│       └── store/        # Zustand state stores
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations layer
│   ├── seed.ts       # Database seeding logic
│   └── replit_integrations/  # AI integration modules
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Database migration files
```

### Key Design Patterns
- **Monorepo Structure**: Client and server share types through `@shared/*` path alias
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` abstracts all database operations
- **Theme System**: CSS custom properties enable light/dark mode and color scheme switching
- **Component Composition**: shadcn/ui pattern with composable, accessible components

## External Dependencies

### Database
- **PostgreSQL**: Primary data store accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with automatic schema inference

### AI Services
- **OpenAI API**: Used for document data extraction (`server/ai-extraction.ts`)
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` for AI services

### Third-Party Libraries
- **Visualization**: Plotly.js, ECharts, Recharts for interactive charts
- **Drag & Drop**: @dnd-kit for dashboard builder functionality
- **Document Parsing**: xlsx for spreadsheet files, mammoth for Word documents
- **Form Handling**: React Hook Form with Zod validation

### Replit Integrations
The `server/replit_integrations/` directory contains modular AI capabilities:
- **Chat**: Conversational AI with conversation persistence
- **Image**: Image generation via OpenAI
- **Batch**: Rate-limited batch processing utilities for LLM operations