# Smart Document Processing System

A full-stack application for processing business documents (invoices and purchase orders) using AI-powered data extraction and custom validation logic.

## Live Demo

[Add link after deployment]

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite + Prisma ORM
- **AI Extraction:** Claude claude-sonnet-4-5 (Anthropic)
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Jest + ts-jest
- **Deployment:** Vercel

## Features

- Upload PDF, image (JPG/PNG/WEBP), CSV, and TXT documents
- AI-powered data extraction via Claude API
- OCR support for images via Claude Vision
- Custom validation engine (totals, dates, line items, duplicates)
- Review interface with manual correction and revalidation
- Status workflow: Uploaded → Processing → Needs Review → Validated / Rejected
- Dashboard with document list, issue counts, and totals grouped by currency

## Prerequisites

- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Setup

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/smart-docs.git
cd smart-docs
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL="file:./prisma/dev.db"
```

**4. Set up the database**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**5. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Running Tests

```bash
npm test
```

14 unit tests covering validation logic: total mismatch, missing fields, date validation, line item calculations, and duplicate detection.

## Docker

**Prerequisites:** Docker and Docker Compose installed.

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up --build -d

# Stop
docker compose down
```

The app will be available at http://localhost:3000.

Make sure your `.env` file has `ANTHROPIC_API_KEY` set before running.

## API Endpoints

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| POST   | `/api/upload`         | Upload and process a document |
| GET    | `/api/documents`      | List all documents            |
| GET    | `/api/documents/[id]` | Get single document           |
| PATCH  | `/api/documents/[id]` | Update document / revalidate  |

### POST /api/upload

Accepts `multipart/form-data` with a `file` field.

Supported types: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `text/csv`, `text/plain`

Response:

```json
{
  "success": true,
  "document": { "id": "...", "status": "validated" },
  "issues": []
}
```

### PATCH /api/documents/[id]

Send updated document fields. Automatically revalidates unless `forceStatus` is provided.

```json
{
  "supplier": "Updated Supplier",
  "total": 120.00
}
```

To force a status without revalidation:

```json
{
  "forceStatus": "validated"
}
```

## Project Structure

```
smart-docs/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── upload/page.tsx             # Upload page
│   ├── document/[id]/page.tsx      # Review page
│   └── api/
│       ├── upload/route.ts         # File upload + extraction
│       └── documents/
│           ├── route.ts            # List documents
│           └── [id]/route.ts       # CRUD + revalidation
├── lib/
│   ├── extraction.ts               # Claude API integration
│   ├── validation.ts               # Custom validation logic
│   ├── db.ts                       # Prisma client
│   └── parsers/
│       ├── pdf.ts                  # PDF text extraction
│       ├── image.ts                # Image to base64
│       ├── csv.ts                  # CSV parsing
│       └── txt.ts                  # Plain text
├── components/
│   ├── StatusBadge.tsx
│   └── ValidationIssues.tsx
├── __tests__/
│   └── validation.test.ts
└── prisma/
    └── schema.prisma
```
