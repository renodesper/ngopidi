# How to Run

Follow these steps to set up and run the project locally.

## 1. Environment Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ngopidi
npm install
```

## 2. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ngopidi?schema=public"
AUTH_SECRET="your-secret-here"
# Optional: AUTH_URL="http://localhost:3000"
```

> [!NOTE]
> The `DATABASE_URL` assumes you are using the default credentials from `docker-compose.yml`.

## 3. Start Database

Start the PostgreSQL / PostGIS database using Docker Compose:

```bash
docker compose up -d
```

## 4. Database Setup

Run Prisma migrations to set up the schema and (optional) seed the database:

```bash
# Apply migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database (optional)
npx prisma db seed
```

## 5. Run Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 6. Accessing Admin Dashboard

If you have seeded the database or created an admin user, you can access the admin dashboard at `/dashboard`.
Check `prisma/seed.ts` (if available) for default credentials.
