# Form Builder Client

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** — Styling
- **React Router v6** — Routing
- **TanStack Query** — Server state management
- **React Hook Form** + **Zod** — Form validation
- **dnd-kit** — Drag and drop
- **Lucide React** — Icons
- **Axios** — HTTP client

## Folder Structure

```
src/
├── app/              # Route pages
├── features/
│   └── form-builder/ # Form builder feature module
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── types/
│       ├── services/
│       └── utils/
├── components/
│   ├── ui/           # shadcn-style base components
│   ├── common/       # Shared components
│   └── layout/       # Layout components
├── lib/
│   ├── api/          # Axios client
│   ├── auth/         # Auth helpers
│   ├── utils/        # Utility functions
│   └── validation/   # Zod schemas
└── types/            # Global TypeScript types
```
