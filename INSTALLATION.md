# Installation & Setup Guide

## System Requirements

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm >= 8.0.0

## Step 1: Database Setup

### Create PostgreSQL Database

```bash
psql -U postgres

CREATE DATABASE microfinance_db;
CREATE USER microfinance WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE microfinance_db TO microfinance;
```

## Step 2: Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with database credentials
npm install
npm run migrate
npm run dev
```

Backend runs on http://localhost:5000

## Step 3: Frontend Setup

```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Step 4: Verify Installation

Backend health check:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "environment": "development"
}
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=microfinance_db
DB_USER=microfinance
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Commands

### Backend
- `npm run dev` - Start dev server
- `npm run migrate` - Initialize database
- `npm run lint` - Lint code
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Lint code

## Troubleshooting

**Database connection error**: Verify PostgreSQL is running and credentials are correct

**Port already in use**: Change PORT in .env or kill process using the port

**Module not found**: Run `npm install` again

**CORS error**: Verify CORS_ORIGIN in backend .env matches frontend URL

---

See README.md for full documentation
