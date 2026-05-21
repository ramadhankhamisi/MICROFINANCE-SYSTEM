# Microfinance Management System

A comprehensive, production-ready microfinance management platform built with modern technologies.

## 🏗 Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware (auth, error, validation)
│   ├── models/          # Data models and schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── validators/      # Input validation schemas
│   ├── utils/           # Helper utilities
│   ├── db/              # Database migrations and seeds
│   └── server.js        # Entry point
├── package.json
├── .env.example
└── logs/
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/     # Authentication pages
│   │   ├── (dashboard)/# Protected dashboard pages
│   ├── components/      # Reusable React components
│   ├── contexts/        # Zustand stores and contexts
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper utilities and API client
│   ├── types/          # TypeScript type definitions
│   ├── styles/         # Global CSS and Tailwind
│   └── layout.tsx      # Root layout
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Features

- ✅ **Branch Management** - Multi-branch support with branch-level access control
- ✅ **Customer Management** - Complete customer lifecycle management
- ✅ **Loan Management** - Create and manage loans with flexible terms
- ✅ **Repayment Tracking** - Track loan repayments and generate reports
- ✅ **Financial Tracking** - Income and expense management
- ✅ **Reports & Analytics** - Comprehensive reports and dashboards
- ✅ **Role-Based Access Control** - Admin, Manager, Officer, Cashier, Staff roles
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Responsive UI** - Mobile-friendly Tailwind CSS design

## 🔐 Authentication & Authorization

### Roles
- **Admin** - Full system access
- **Branch Manager** - Branch-level management
- **Loan Officer** - Create and manage loans
- **Cashier** - Record transactions and repayments
- **Staff** - View and support operations

### Middleware
- JWT verification on protected routes
- Role-based access control (RBAC)
- Request logging and validation

## 🗄 Database Schema

### Core Tables
- `branches` - Branch information
- `users` - Staff and system users
- `customers` - Microfinance customers
- `loans` - Loan records
- `repayments` - Repayment transactions
- `transactions` - Income/expense records

All tables include timestamps and soft-delete patterns where applicable.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database**
   ```bash
   npm run migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan

### Repayments
- `GET /api/repayments` - List repayments
- `POST /api/repayments` - Record repayment

### Reports
- `GET /api/reports/profit-loss` - P&L report
- `GET /api/reports/portfolio` - Portfolio report

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/metrics` - Dashboard metrics

## 🏗 Architecture Principles

### Backend
- **Service Layer Pattern** - Business logic separated from routes
- **Error Handling** - Centralized error middleware
- **Middleware Stack** - Authentication, validation, logging
- **Database Abstraction** - Connection pooling and query helpers
- **Environment Configuration** - 12-factor app principles

### Frontend
- **Component Composition** - Reusable, composable components
- **State Management** - Zustand for lightweight state
- **API Client** - Centralized axios instance with interceptors
- **Type Safety** - Full TypeScript support
- **Responsive Design** - Tailwind CSS utility-first styling

## 🔒 Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with configurable expiration
- Refresh token rotation
- CORS configuration
- Request validation with express-validator
- Helmet.js for HTTP security headers
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS protection via framework defaults

## 📊 Database Best Practices

- Connection pooling for performance
- Indexed commonly queried fields
- Foreign key constraints
- Transaction support for data consistency
- Timestamp fields (created_at, updated_at)
- Soft deletes via status fields

## 🔧 Development Commands

### Backend
```bash
npm run dev       # Start dev server with auto-reload
npm run build     # Build for production
npm start         # Start production server
npm run migrate   # Run database migrations
npm run lint      # Lint code
npm test          # Run tests
```

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Lint code
npm run type-check # Check TypeScript
```

## 🌐 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=microfinance_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENV=development
```

## 📈 Scalability Considerations

- Database query pagination implemented
- Connection pooling configured
- Caching layer ready for Redis integration
- Microservice-ready API structure
- Frontend lazy loading support
- CDN-ready static asset structure

## 🚀 Production Deployment

### Backend
1. Build Docker image or deploy Node.js
2. Set production environment variables
3. Configure database backups
4. Setup monitoring and logging
5. Configure HTTPS/SSL
6. Setup rate limiting

### Frontend
1. Build static assets with `npm run build`
2. Deploy to CDN or Next.js hosting
3. Configure environment variables
4. Setup caching headers
5. Configure domain and HTTPS

## 📝 License

Private - Microfinance System

## 📞 Support

For issues or questions, contact the development team.
