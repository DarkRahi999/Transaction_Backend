# Daily Transaction Tracker

A comprehensive full-stack application for tracking daily income and expenses with intuitive dashboards and reporting features.

## Author

Bisakto Rahi

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Building for Production](#building-for-production)
- [Database](#database)
- [Folder Structure](#folder-structure)

## Features

- Track daily income and expenses
- Categorize transactions (salary, food, transport, entertainment, etc.)
- View transaction history with pagination
- Generate monthly and yearly financial reports
- Visualize financial data with charts and tables
- Responsive design for all device sizes
- Dark mode support
- Form validation with Zod
- RESTful API architecture

## Tech Stack

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS v3
- shadcn/ui components
- React Hook Form
- Zod for validation
- Axios for HTTP requests
- Lucide React for icons

### Backend
- NestJS
- TypeScript
- MikroORM with PostgreSQL
- Class Validator
- Dotenv for environment management
- Swagger for API documentation

### Database
- PostgreSQL

## Project Structure

```
Daily Transaction/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── transaction/
│   │   │   ├── dto/
│   │   │   ├── transaction.controller.ts
│   │   │   ├── transaction.entity.ts
│   │   │   ├── transaction.module.ts
│   │   │   └── transaction.service.ts
│   │   ├── utils/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── .env
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── expense-tracker/
    │   │   │   ├── create/
    │   │   │   ├── [txId]/
    │   │   │   └── page.tsx
    │   │   ├── reports/
    │   │   │   ├── monthly/
    │   │   │   ├── total/
    │   │   │   ├── weekly/
    │   │   │   └── yearly/
    │   │   └── page.tsx
    │   ├── components/
    │   │   ├── feature/
    │   │   └── ui/
    │   ├── config/
    │   ├── hook/
    │   ├── interface/
    │   ├── lib/
    │   ├── services/
    │   └── style/
    ├── .env
    ├── .env.example
    ├── next.config.ts
    ├── package.json
    └── tailwind.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 13.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Daily Transaction"
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

1. Backend setup:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other configurations.

2. Frontend setup:
   ```bash
   cd frontend
   cp .env.example .env
   ```
   Update the `.env` file with your API URL.

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run database migrations (if applicable):
   ```bash
   npm run migration:run
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```
   The backend will be available at `http://localhost:3000`

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3001`

## API Documentation

Interactive API documentation is available through Swagger UI.

Once the backend is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

This provides a complete interactive interface to explore and test all API endpoints.

### Base URL
`http://localhost:3000/api`

### Transaction Endpoints

- `GET /transactions` - Get all transactions (limited to 50 most recent)
- `GET /transactions/paginated?page=:page&limit=:limit` - Get paginated transactions
- `POST /transactions` - Create a new transaction
- `GET /transactions/:id` - Get a specific transaction
- `PATCH /transactions/:id` - Update a transaction
- `DELETE /transactions/:id` - Delete a transaction
- `GET /transactions/summary` - Get transaction summary
- `GET /transactions/daily-summary?date=:date` - Get daily summary
- `GET /transactions/monthly-summary?year=:year&month=:month` - Get monthly summary
- `GET /transactions/yearly-summary?year=:year` - Get yearly summary

### Summary Endpoints

- `GET /summary-report` - Get total summary report
- `GET /weekly-summary?startDate=:date` - Get weekly summary
- `GET /monthly-summary?year=:year&month=:month` - Get monthly summary
- `GET /current-month-summary` - Get current month summary
- `GET /paginated-monthly-summaries?page=:page&limit=:limit` - Get paginated monthly summaries
- `GET /yearly-summary?year=:year` - Get yearly summary

## Building for Production

### Backend

```bash
cd backend
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm run build
npm run start
```

## Database

This application uses PostgreSQL as its database. Make sure you have PostgreSQL installed and running.

### Database Schema

The application uses MikroORM for database interactions. The main entity is `Transaction` with the following fields:
- id: number (primary key)
- amount: number
- type: string (income/expense)
- category: string
- description: string
- transactionDate: Date
- balance: number
- createdAt: Date
- updatedAt: Date

## Folder Structure Details

### Backend (`/backend`)

- `src/config/` - Configuration files including database setup
- `src/transaction/` - Transaction module with controllers, services, entities and DTOs
- `src/utils/` - Utility functions and enums
- `src/app.*` - Main application files
- `src/main.ts` - Application entry point

### Frontend (`/frontend`)

- `src/app/` - Next.js app router pages
  - `expense-tracker/` - Main transaction tracking interface
  - `reports/` - Various financial reports
- `src/components/` - Reusable UI components
- `src/config/` - Configuration files
- `src/hooks/` - Custom React hooks
- `src/interface/` - TypeScript interfaces
- `src/lib/` - Utility functions
- `src/services/` - API service functions
- `src/style/` - Global styles

---

Built with ❤️ by Bisakto Rahi