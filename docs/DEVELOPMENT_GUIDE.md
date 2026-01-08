# Development Guide

This guide provides information on how to develop for the "ngopidi" project, including coding standards, project structure, and workflow.

## Tech Stack Overview

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Auth.js (NextAuth.v5)](https://authjs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)

## Coding Standards

### Components

- Functional components with TypeScript interfaces for props.
- Use `lucide-react` for icons.
- Follow Shadcn UI patterns for consistency.

### Data Fetching & Actions

- Use **Server Actions** for mutations (located in `app/actions`).
- Use **Server Components** for data fetching where possible.
- Wrap database calls with `prisma` client from `@/lib/prisma`.

### Styling

- Use Tailwind CSS utility classes.
- Follow the design tokens defined in `app/globals.css`.

### Schema Changes

1. Modify `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>` to generate and apply the migration.
3. The client will be automatically generated.

## Spatial Data

The project uses PostGIS for spatial data. When working with coordinates:

- The `geo` field in the `Place` model is an `Unsupported("geography(Point,4326)")`.
- Raw SQL queries might be needed for specific spatial operations (e.g., finding places within a radius).

## Workflows

### Adding a New UI Component

```bash
npx shadcn-ui@latest add <component-name>
```

### Adding a New Server Action

1. Create or update a file in `app/actions`.
2. Use the `"use server"` directive at the top of the file.
3. Implement validation using Zod.
