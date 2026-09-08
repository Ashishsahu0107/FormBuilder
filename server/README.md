# Form Builder Server

## Setup

### 1. .env file banao
```bash
cp .env.example .env
```

`.env` mein apni DB credentials fill karo:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/formbuilder?schema=public"
MONGODB_URI="mongodb://localhost:27017/formbuilder"
JWT_SECRET=your-secret-here
```

### 2. Dependencies install karo
```bash
npm install
```

### 3. Prisma setup karo
```bash
# Schema database pe push karo
npm run db:migrate

# Prisma client generate karo
npm run db:generate
```

### 4. Dev server start karo
```bash
npm run dev
```

Server `http://localhost:5000` pe run karega.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### Forms (Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms` | List all forms |
| POST | `/api/forms` | Create form |
| GET | `/api/forms/:id` | Get form by ID |
| PATCH | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Delete form |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions/:slug` | Submit form (Public) |
| GET | `/api/submissions/form/:formId` | Get submissions (Auth) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Database

| Database | ORM | Purpose |
|----------|-----|---------|
| PostgreSQL | Prisma | Users, Forms, Fields, Templates |
| MongoDB | Mongoose | Submissions, Audit Logs |

## Tech Stack

- **Express** + **TypeScript**
- **Prisma** → PostgreSQL
- **Mongoose** → MongoDB
- **JWT** — Authentication
- **Zod** — Validation
- **Helmet + CORS + Rate Limit** — Security
