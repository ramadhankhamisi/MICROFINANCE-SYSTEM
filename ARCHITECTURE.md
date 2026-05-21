# System Architecture

## Overview

This is a modern, scalable microfinance management system built with:
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js with Node.js, PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Deployment**: Cloud-ready containerized architecture

## Clean Architecture Layers

### Backend Architecture

```
┌─────────────────────────────────────────────┐
│         Express Server (Port 5000)          │
├─────────────────────────────────────────────┤
│  HTTP Layer (Routes, Controllers)           │
├─────────────────────────────────────────────┤
│  Middleware Layer (Auth, Validation, Error) │
├─────────────────────────────────────────────┤
│  Business Logic Layer (Services)            │
├─────────────────────────────────────────────┤
│  Data Access Layer (Database Queries)       │
├─────────────────────────────────────────────┤
│  PostgreSQL Database                         │
└─────────────────────────────────────────────┘
```

### Request Flow

```
Request → Routes → Controllers → Services → Database
  ↓          ↓           ↓          ↓
Validation Middleware → Authentication → Authorization
  ↓
Response ← Error Handler
```

## Security Architecture

### Authentication Flow

```
User Credentials
      ↓
   Login Endpoint
      ↓
   Verify Password (bcryptjs)
      ↓
   Generate JWT Token
      ↓
   Store Refresh Token
      ↓
   Return Access & Refresh Tokens
```

### Authorization

- **Role-Based Access Control (RBAC)**: 5-tier role hierarchy
- **Token Validation**: JWT verification on protected routes
- **Branch Isolation**: Data scoped to user's branch
- **Middleware Stack**: Applied before handlers

## Database Design

### Entity Relationships

```
Branches
  ↓
  ├─ Users (Staff)
  │   ├─ Refresh Tokens
  │   └─ Audit Trail
  │
  ├─ Customers
  │   └─ Loans
  │       └─ Repayments
  │
  └─ Transactions (Income/Expense)
```

### Key Design Patterns

- **Polymorphic Tables**: Transactions handle multiple types
- **Audit Trail**: created_at, updated_at on all records
- **Soft Deletes**: Status fields for logical deletion
- **Referential Integrity**: Foreign key constraints
- **Indexing**: Performance optimization for common queries

## API Architecture

### RESTful Conventions

```
GET    /api/resource           → List all
POST   /api/resource           → Create
GET    /api/resource/:id       → Get one
PUT    /api/resource/:id       → Update
DELETE /api/resource/:id       → Delete
```

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource data */ },
  "timestamp": "2024-05-21T10:30:00Z"
}
```

### Error Handling

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email" }
    ]
  },
  "timestamp": "2024-05-21T10:30:00Z"
}
```

## Frontend Architecture

### Component Structure

```
App (Root)
├── Layout
│   ├── Navigation
│   ├── Sidebar
│   └── Main Content
│       ├── Pages (Route-specific)
│       └── Components (Reusable)
```

### State Management (Zustand)

```
Auth Store
├── user: User
├── accessToken: string
├── refreshToken: string
├── setUser()
└── logout()

Other Stores (Ready for expansion)
├── Customer Store
├── Loan Store
├── Dashboard Store
```

### Data Flow

```
User Action
    ↓
Component Hook (useAuth, useCustomers)
    ↓
API Call (apiClient)
    ↓
Zustand Store Update
    ↓
Component Re-render
```

## Middleware Stack

### Backend Middleware Order

1. **Helmet** - Security headers
2. **CORS** - Cross-origin requests
3. **Body Parser** - JSON parsing
4. **Morgan** - Request logging
5. **Custom Logger** - File logging
6. **Routes** - API endpoints
7. **Authentication** - Token validation
8. **Authorization** - Role verification
9. **Validation** - Input checking
10. **Error Handler** - Error catching

## Database Connection

### Connection Pool

```javascript
Pool Configuration
├── Min connections: 2
├── Max connections: 10
├── Idle timeout: 30s
└── Connection timeout: 2s
```

### Query Patterns

- **Parameterized queries**: Prevents SQL injection
- **Transaction support**: Data consistency
- **Connection pooling**: Performance optimization
- **Error handling**: Graceful failures

## Scalability Features

### Implemented

- Connection pooling
- Database indexing
- Request pagination
- Response compression via Helmet
- CORS configuration
- Rate limiting ready
- Service layer abstraction

### Ready for Enhancement

- Redis caching layer
- Message queue integration
- Microservice decomposition
- Horizontal scaling
- Load balancing
- CDN integration

## Deployment Architecture

### Development

```
Development
├── Frontend (npm run dev)
├── Backend (npm run dev)
└── PostgreSQL (localhost)
```

### Production

```
Production
├── Frontend (Next.js on CDN/Vercel)
├── Backend (Node.js on Container)
├── Database (PostgreSQL on RDS)
├── Cache (Redis optional)
└── Monitoring (Logs, APM)
```

## Performance Optimizations

### Backend
- Database query optimization
- Connection pooling
- Request compression
- Caching headers
- Indexed database fields

### Frontend
- Code splitting
- Image optimization
- CSS-in-JS minification
- Bundle analysis
- Lazy loading

## Monitoring & Logging

### Logging
- Request/response logging
- Error logging
- File-based logs with dates
- Structured logging ready

### Monitoring Ready For
- APM tools (DataDog, New Relic)
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

## Security Considerations

- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ JWT token rotation
- ✅ Refresh token storage
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection (React default)
- ✅ CSRF protection ready
- ✅ Rate limiting ready
- ✅ API key support ready

## Testing Architecture

### Backend Testing Structure
- Unit tests (services, utils)
- Integration tests (API endpoints)
- Database tests (with test database)

### Frontend Testing Structure
- Component tests (React Testing Library)
- Hook tests (userAuth, useApi)
- Integration tests

## Future Enhancements

### Phase 2
- Advanced reporting
- SMS/Email notifications
- Mobile app (React Native)
- Advanced analytics

### Phase 3
- AI-powered risk assessment
- Blockchain integration (audit trail)
- Advanced forecasting
- Mobile wallet integration

---

**Last Updated**: 2024-05-21
**Architecture Version**: 1.0
