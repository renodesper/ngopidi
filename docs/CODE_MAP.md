# Code Map

This document provides a high-level overview of the project's directory structure and the responsibility of each part.

## Directory Structure

```text
ngopidi/
├── app/                  # Next.js App Router (pages, layout, actions, api)
│   ├── actions/          # Server Actions for mutations
│   ├── admin/            # Admin-only dashboard pages
│   ├── api/              # API Route Handlers
│   ├── dashboard/        # User dashboard pages (role-based content)
│   ├── login/            # Authentication pages
│   ├── register/         # User registration pages
│   ├── submit/           # Place submission pages
│   ├── globals.css       # Global styles and tailwind directives
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing / Map page
├── components/           # React components (Atomic Design)
│   ├── atoms/            # Basic UI elements (button, input, label, etc.)
│   ├── molecules/        # Composite components (card, dialog, form, etc.)
│   ├── organisms/        # Complex components (PlacesTable, Sidebar, Map, etc.)
│   └── providers/        # Context providers (Providers.tsx)
├── lib/                  # Shared utilities and library configurations
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Tailwind merge and common utilities
├── prisma/               # Prisma schema and migrations
│   ├── migrations/       # SQL migration files
│   └── schema.prisma     # Database schema definition
├── public/               # Static assets (images, icons, etc.)
├── .env                  # Environment variables (not tracked)
├── auth.ts               # Auth.js configuration (JWT strategy with user ID & role)
├── components.json       # Shadcn UI configuration
├── docker-compose.yml    # Database container configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Core Modules

### 1. Authentication (`auth.ts`, `app/login`, `app/register`, `app/actions/auth.ts`)

Handles user login, registration, session management, and role-based access control (Admin/User). Uses JWT strategy with user `id` and `role` propagated through the token to the session.

### 2. Map & UI (`components/organisms/Map.tsx`, `components/organisms/PlaceDetails.tsx`)

The heart of the application, rendering the interactive map and displaying details for selected coffee shops.

### 3. Place Management (`app/actions/places.ts`, `app/dashboard`, `app/admin`, `app/submit`)

Covers the CRUD operations for coffee shops, including:
- User submissions with `submitter_id` tracking
- Role-based authorization (users can only edit/delete their own places)
- Admin moderation and verification

### 4. Dashboard (`app/dashboard`, `app/admin`)

Role-based dashboards:
- **User Dashboard** (`/dashboard`): Shows places management with role-based visibility (Total Users card hidden for non-admin users)
- **Admin Dashboard** (`/admin`): Full administrative access including user management

### 5. Database Schema (`prisma/schema.prisma`)

Defines the `User`, `Account`, `Session`, `Place`, and `PlaceImage` models, including PostGIS spatial data fields.
