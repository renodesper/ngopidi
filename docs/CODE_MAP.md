# Code Map

This document provides a high-level overview of the project's directory structure and the responsibility of each part.

## Directory Structure

```plain
ngopidi/
├── app/                  # Next.js App Router (pages, layout, actions, api)
│   ├── actions/          # Server Actions for mutations
│   ├── api/              # API Route Handlers
│   ├── dashboard/        # Admin dashboard pages
│   ├── login/            # Authentication pages
│   ├── submit/           # Place submission pages
│   ├── globals.css       # Global styles and tailwind directives
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing / Map page
├── components/           # React components
│   ├── admin/            # Dashboard specific components
│   ├── ui/               # Reusable UI components (Shadcn UI)
│   ├── Map.tsx           # Main map component (Leaflet)
│   └── PlaceDetails.tsx  # Sidebar/Modal for place information
├── lib/                  # Shared utilities and library configurations
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Tailwind merge and common utilities
├── prisma/               # Prisma schema and migrations
│   ├── migrations/       # SQL migration files
│   └── schema.prisma     # Database schema definition
├── public/               # Static assets (images, icons, etc.)
├── .env                  # Environment variables (not tracked)
├── auth.ts               # Auth.js configuration
├── components.json       # Shadcn UI configuration
├── docker-compose.yml    # Database container configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Core Modules

### 1. Authentication (`auth.ts`, `app/login`, `app/actions/auth.ts`)

Handles user login, session management, and role-based access control (Admin/User).

### 2. Map & UI (`components/Map.tsx`, `components/PlaceDetails.tsx`)

The heart of the application, rendering the interactive map and displaying details for selected coffee shops.

### 3. Place Management (`app/actions/places.ts`, `app/dashboard`, `app/submit`)

Covers the CRUD operations for coffee shops, including admin moderation and user submissions.

### 4. Database Schema (`prisma/schema.prisma`)

Defines the `User`, `Account`, `Session`, `Place`, and `PlaceImage` models, including PostGIS spatial data fields.
