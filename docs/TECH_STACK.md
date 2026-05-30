# 🏗️ Tech Stack Architecture

Dokumentasi teknis mengenai pilihan teknologi dan arsitektur Jepangku News MVP.

## 📋 Daftar Isi

- [Overview](#overview)
- [Frontend & Backend](#frontend--backend)
- [Database](#database)
- [Storage](#storage)
- [Authentication](#authentication)
- [Styling & UI](#styling--ui)
- [Development Tools](#development-tools)
- [Deployment](#deployment)

## 🎯 Overview

Jepangku News MVP dibangun sebagai **Full-Stack Next.js Application**, artinya:

- ✅ Frontend dan Backend dalam satu project
- ✅ API routes built-in di Next.js
- ✅ Type-safe dengan TypeScript end-to-end
- ✅ Server Components untuk performance optimal
- ✅ Scalable architecture untuk future multi-app

### Arsitektur Diagram

```
┌─────────────────────────────────────────────────┐
│        Jepangku News MVP (Single App)           │
├─────────────────────────────────────────────────┤
│                  Next.js 14+                    │
├────────────────┬────────────────┬───────────────┤
│   Frontend     │   API Routes   │   Database    │
│   (React)      │   (Backend)    │ (PostgreSQL)  │
├────────────────┴────────────────┴───────────────┤
│     Cloudflare R2 (Object Storage)              │
└─────────────────────────────────────────────────┘
```

## 🎨 Frontend & Backend

### Teknologi Utama

| Aspek | Teknologi | Versi | Alasan |
|-------|-----------|-------|--------|
| Framework | **Next.js** | 14+ | Full-stack, SSR/SSG, API routes |
| Language | **TypeScript** | 5+ | Type safety, developer experience |
| UI Library | **React** | 19+ | Component-based, built-in dengan Next.js |
| Styling | **Tailwind CSS** | 3+ | Utility-first, rapid development |
| Components | **shadcn/ui** | Latest | Accessible, customizable UI components |
| Runtime | **Node.js** | 18+ | JavaScript runtime untuk backend |

### Mengapa Next.js?

**Keuntungan Next.js vs Python+React Stack**:

1. **Single Language** (JavaScript/TypeScript)
   - Developer dapat bekerja di frontend dan backend
   - Sharing code/types lebih mudah
   - Learning curve lebih kecil

2. **Built-in API Routes**
   - Tidak perlu separate backend (seperti Flask/FastAPI)
   - Deployment lebih simpel (satu project)
   - Faster development cycle

3. **Server-Side Rendering (SSR)**
   - Better SEO untuk artikel berita
   - Server Components untuk performance
   - Streaming untuk user experience lebih baik

4. **Scalability**
   - Mudah di-split ke multiple apps di future
   - Shared types across monorepo
   - API-first architecture

5. **Developer Experience**
   - Hot reload untuk development
   - Automatic route generation
   - Middleware built-in
   - Image optimization

### Struktur Next.js App

```
app/
├── (auth)              # Auth group - login, register, logout
├── (public)            # Public group - artikel, quiz, polling
├── (user)              # Protected - dashboard user
├── (admin)             # Protected - admin dashboard
├── api/                # API routes
│   ├── auth/           # /api/auth/*
│   ├── articles/       # /api/articles/*
│   ├── quiz/           # /api/quiz/*
│   ├── polls/          # /api/polls/*
│   ├── users/          # /api/users/*
│   └── upload/         # /api/upload/*
├── layout.tsx          # Root layout
└── page.tsx            # Home page
```

## 💾 Database

### PostgreSQL

**Alasan Pilihan**:
- ✅ ACID compliance - data integrity
- ✅ Advanced features (JSONB, arrays, enums)
- ✅ Excellent for relational data
- ✅ Open source dan mature
- ✅ Good ecosystem dengan Node.js

### Prisma ORM

**Alasan**:
- ✅ Type-safe database queries
- ✅ Auto-generated Prisma client
- ✅ Migration management built-in
- ✅ Great DX dengan Prisma Studio
- ✅ Support multiple databases (PostgreSQL, MySQL, SQLite)

### Schema Design (MVP)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   (hashed)
  role      Role     @default(USER)
  points    Int      @default(0)
  createdAt DateTime @default(now())
}

model Article {
  id          String   @id @default(cuid())
  title       String
  content     String
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  status      ArticleStatus (DRAFT, PENDING, PUBLISHED, REJECTED)
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  image       String?  (R2 URL)
  views       Int      @default(0)
  createdAt   DateTime @default(now())
}

model Quiz {
  id        String     @id @default(cuid())
  title     String
  questions Question[]
  createdAt DateTime   @default(now())
}

model Points {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  amount    Int
  action    String   (ARTICLE_PUBLISHED, QUIZ_COMPLETED, POLL_VOTED)
  createdAt DateTime @default(now())
}
```

## 📦 Storage

### Cloudflare R2

**Alasan R2 vs alternatif**:

| Fitur | R2 | AWS S3 | Firebase |
|-------|-----|---------|----------|
| **Cost Model** | Pay for storage only | Pay for upload + download | Pay for operations |
| **Egress** | ✅ FREE | ❌ $$$ per GB | ✅ Termasuk |
| **S3 Compatible** | ✅ Ya | ✅ Native | ❌ Tidak |
| **CDN Included** | ✅ Cloudflare CDN | ❌ Extra (CloudFront) | ✅ Firebase CDN |
| **Performance** | ⚡ Excellent | ⚡ Excellent | ⚡ Excellent |
| **Scalability** | ✅ Unlimited | ✅ Unlimited | ⚠️ Depends on plan |

**Use Cases di Jepangku**:
- 📸 Article thumbnail images
- 🎥 Featured images
- 📄 User avatar uploads
- 📰 PDF exports (future)

### Upload Flow

```
1. User memilih file di UI
   ↓
2. File dikirim ke /api/upload
   ↓
3. Backend validate file (type, size)
   ↓
4. Backend upload ke R2 menggunakan AWS SDK
   ↓
5. Return public URL dari R2
   ↓
6. Store URL di database
```

## 🔐 Authentication

### JWT + Session

**Implementasi**:
```
1. User login dengan email + password
   ↓
2. Server validate & create JWT token
   ↓
3. Token disimpan di HTTP-only cookie
   ↓
4. Client attach token ke setiap request
   ↓
5. Server verify token di middleware
```

**Libraries**:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT handling
- Next.js middleware - Route protection

### Authorization

**Role-based Access Control (RBAC)**:

```typescript
enum Role {
  ADMIN = 'ADMIN',    // Full access
  USER = 'USER',      // Limited access
  GUEST = 'GUEST'     // No login required
}

// Middleware example
async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect('/login');
  }
  
  if (token) {
    const user = verifyToken(token);
    if (user.role !== 'ADMIN' && request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect('/');
    }
  }
}
```

## 🎨 Styling & UI

### Tailwind CSS

**Alasan**:
- ✅ Utility-first approach
- ✅ Smaller CSS bundle vs traditional CSS
- ✅ Rapid development
- ✅ Easy customization
- ✅ Built-in responsive design

### shadcn/ui

**Alasan**:
- ✅ Copy-paste components (full control)
- ✅ Built on Radix UI (accessible primitives)
- ✅ Styled with Tailwind
- ✅ TypeScript support
- ✅ No component library lock-in

**Components yang digunakan**:
- Button, Card, Input, Label
- Form (with React Hook Form)
- Dialog, Drawer, Popover
- Dropdown Menu, Navigation Menu
- Tabs, Accordion
- dan lebih banyak lagi

### Responsive Design

```typescript
// Contoh dengan Tailwind responsive
export function ArticleCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Responsive grid: 1 kolom di mobile, 2 di tablet, 3 di desktop */}
    </div>
  );
}
```

## 🛠️ Development Tools

### Build & Bundling
- **Webpack** - Built-in di Next.js
- **SWC** - Faster compilation
- **Turbopack** - Next generation bundler (future)

### Testing
- **Jest** - Unit testing
- **Playwright** - E2E testing (optional)
- **React Testing Library** - Component testing

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Development
- **Hot Module Replacement (HMR)** - Built-in
- **Fast Refresh** - React component updates
- **Prisma Studio** - Database visualization

## 🚀 Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build    # Creates optimized build
npm run start    # Starts production server
```

### Deployment Options

#### 1. **Vercel** (Recommended)
```bash
# Deploy dengan satu command
vercel
```
- ✅ Creators of Next.js
- ✅ Zero-config deployment
- ✅ Automatic CI/CD
- ✅ Preview deployments
- ✅ Serverless functions (API routes)

#### 2. **Self-Hosted (Docker)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

#### 3. **Other Platforms**
- AWS (EC2, ECS, Lambda)
- Google Cloud Run
- Azure App Service
- DigitalOcean App Platform
- Railway, Render, Heroku

## 📊 Performance Considerations

### Frontend Performance
- Server Components untuk reduce client JS
- Image optimization dengan `next/image`
- Code splitting automatic
- CSS-in-JS minimization

### Backend Performance
- Database query optimization
- Caching strategy (Redis future)
- Rate limiting untuk API

### Storage Performance
- R2 dengan CDN integration
- Image resizing & optimization
- Cached public URLs

## 🔄 Scaling untuk Ekosistem Multi-App

Struktur saat ini sudah siap untuk future scaling:

```
Phase 1 (Current): Single Next.js App
├── app/
├── lib/
└── prisma/

Phase 2: Monorepo Structure
├── apps/
│   ├── news/        # Portal berita
│   ├── learn/       # LMS
│   └── admin/       # Admin dashboard
├── packages/
│   ├── shared/      # Shared types
│   ├── auth/        # Auth logic
│   └── ui/          # UI components
└── prisma/          # Shared database

Phase 3: Microservices (jika diperlukan)
├── news-service/
├── learn-service/
├── auth-service/
└── file-service/
```

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

---

**Questions?** Lihat dokumentasi lengkap di `docs/` folder.
