# Project Setup - Complete

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

Runs on: http://localhost:5000

## Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs on: http://localhost:3000

## Environment Files

Backend .env - Database and JWT configuration
Frontend .env.local - API URL configuration

## Database

PostgreSQL with 7 tables:
- branches
- users
- customers
- loans
- repayments
- transactions
- refresh_tokens

## API Endpoints

- POST /api/auth/login - Login
- GET /api/auth/profile - Get profile
- GET/POST /api/customers - Customer management
- GET/POST /api/loans - Loan management
- GET/POST /api/repayments - Repayment tracking

## Features

- JWT Authentication
- Role-Based Access Control
- Request Validation
- Error Handling
- Logging System
- Responsive UI

All files are ready for feature implementation.
