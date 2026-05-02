# Submission — Smart Document Processing System

## Approach

### Architecture Decision
I chose a monolithic Next.js setup (frontend + API routes in one project) rather than a separate backend. For this scope, it reduces complexity without sacrificing anything meaningful — Next.js API routes are full Node.js handlers.

### AI-Powered Extraction
The core extraction is handled by Claude claude-sonnet-4-5 via the Anthropic API. Rather than building brittle regex parsers for each document format, I send the document content (text or image) to Claude with a structured prompt and receive a consistent JSON response. This handles all four formats (PDF, image, CSV, TXT) with a single code path and works well on messy or semi-structured inputs.

For images, Claude Vision is used directly — no separate OCR library needed.

### Custom Validation Engine
Per the task requirements, all validation logic is written independently in `lib/validation.ts` without AI involvement:

- **Total mismatch:** Checks that `subtotal + tax = total` with 0.01 floating point tolerance
- **Line item calculations:** Verifies `quantity × unitPrice = lineItem.total` for each row
- **Date validation:** Ensures issue date is not after due date
- **Missing fields:** Flags required fields (supplier, docNumber, total) as errors, optional fields as warnings
- **Duplicate detection:** Queries the database for existing document numbers on every upload and revalidation

### Revalidation Flow
When a user manually corrects extracted data and saves, the server reruns the full validation logic on the updated values and updates both `validationIssues` and `status` automatically. This distinguishes between "Save Changes" (triggers revalidation) and "Validate/Reject" buttons (force status).

### Handling Intentionally Incorrect Documents
The validation engine is designed to catch inconsistencies regardless of source. A document with a wrong total, missing fields, or incorrect line item math will always be flagged as `needs_review` with specific error messages pointing to the exact field and expected value.

## AI Tools Used

- **Claude (claude.ai)** — Used as a coding assistant to accelerate development (architecture decisions, debugging, and code generation). All generated code was reviewed, adapted, and fully understood before being integrated into the solution.
- **Claude API (claude-sonnet-4-5)** — Used at runtime for document data extraction.

## What I Would Improve

1. **Batch upload** — Currently processes one document at a time. A batch upload with a progress indicator would be more practical for real use.

2. **Discount/credit support** — The current model does not have a `discount` field. Documents with discounts will correctly flag a total mismatch, but the system cannot explain why. Adding a `discount` field to the extraction model and validation logic would resolve this.

3. **Persistent storage** — Using PostgreSQL (Neon) for production deployment on Vercel. For even better scalability, would consider connection pooling with PgBouncer.

4. **Extraction confidence scores** — Claude could return a confidence level per field, allowing the UI to highlight uncertain extractions differently from definite ones.

5. **Webhook / async processing** — For large PDFs, extraction can take 3-5 seconds. Moving this to a background job with status polling would improve UX.

6. **User authentication** — Currently there is no auth. In production, documents should be scoped to users or organizations.

7. **Audit trail** — Track every change made to a document (who changed what and when) for compliance purposes.

8. **Export functionality** — Allow exporting validated documents as CSV or pushing to an ERP system.

9. **Server state management** — Data fetching is currently handled with `useEffect` + `useState` for simplicity. In a production app I would replace this with TanStack Query (React Query) for automatic caching, background refetching, loading/error states, and query invalidation after mutations.

