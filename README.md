# OLaunch 

A full stack feature rollout and experimentation platform built with TypeScript, React, Express.js, PostgreSQL, Redis.

**Overview**  
OLaunch helps developers control how new features are released.
It supports feature flags, gradual rollouts, and performance tracking before a full launch. The platform also handles environment specific settings, real-time updates, and background jobs for collecting rollout data. An AI module reviews those metrics and suggests whether to keep expanding or pause a release.

## Stack
Frontend: React (Next.js) with TypeScript and Tailwind  
Backend: Express.js with TypeScript and Zod  
Database: PostgreSQL using Prisma ORM  
Caching/Queue: Redis with BullMQ  
Infrastructure: Docker Compose for local use and AWS-ready deployment  

**Features**
- Create and edit feature flags with environment specific settings  
- Hash based rollout evaluation for gradual releases  
- Real-time configuration updates using server sent events (SSE) 
- Background worker for processing rollout metrics
- AI rollout analysis module that reviews performance data and suggests adjustments

## Quick start
1) Copy env:  
   `cp .env.example .env`

2) Start databases (Postgres, optional Redis):  
   `docker compose up -d`

3) Install deps:  
   `pnpm i`

4) Migrate + seed:  
   `pnpm -w prisma:migrate && pnpm -w prisma:seed`

5) Dev servers:  
   `pnpm dev`  
   - web: http://localhost:3000  
   - api: http://localhost:4000

If Redis isn't running, the worker app starts in a no-op mode. The rest still works.
















