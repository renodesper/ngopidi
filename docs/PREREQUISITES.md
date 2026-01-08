# Prerequisites

Before you begin, ensure you have the following installed on your local machine:

## Core Requirements

- **Node.js**: Version 20 or higher (current project uses `next: 16.1.1` and `react: 19.2.3`). Recommended to use a version manager like `nvm` or `mise`.
- **npm**: Usually comes with Node.js. Used for managing dependencies.
- **Docker & Docker Compose**: Required for running the PostgreSQL database with PostGIS extensions locally.
- **Git**: For version control and cloning the repository.

## Database

- **PostgreSQL**: The project uses PostgreSQL with the **PostGIS** extension for spatial data (storing coffee shop coordinates).
- **Prisma**: Used as the ORM. You should have `prisma` and `@prisma/client` installed as part of the project dependencies.

## Optional but Recommended

- **VS Code Extensions**:
  - Prisma (for syntax highlighting and linting of `.prisma` files)
  - PostCSS Language Support
  - Tailwind CSS IntelliSense
- **PostGIS aware DB tool**: Such as DBeaver or TablePlus for easier visual inspection of spatial data.
