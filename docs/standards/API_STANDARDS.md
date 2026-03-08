# API Standards — The Codex

## Route Structure

All API routes live under `src/app/api/` using Next.js App Router conventions.

```
src/app/api/
  documents/
    route.ts              # GET (list), POST (create)
    [id]/
      route.ts            # GET (by id), PATCH (update), DELETE
  chat/
    route.ts              # POST (streaming chat)
  search/
    route.ts              # POST (hybrid search)
  embeddings/
    route.ts              # POST (trigger indexing)
  webhooks/
    clerk/
      route.ts            # POST (user sync)
```

## HTTP Methods

| Method | Purpose | Status Codes |
|---|---|---|
| `GET` | Retrieve resource(s) | 200, 404 |
| `POST` | Create resource or trigger action | 201 (created), 200 (action) |
| `PATCH` | Partial update | 200 |
| `DELETE` | Remove resource | 204 (no body) |

`PUT` is not used — prefer `PATCH` for partial updates.

## Request / Response Envelope

### Success Response

```json
{
  "data": { ... }
}
```

For lists with pagination:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Error Response

```json
{
  "error": "Human-readable error message",
  "code": "DOCUMENT_NOT_FOUND",
  "details": {}
}
```

- `error`: always present, user-friendly message
- `code`: machine-readable error code (optional, for client handling)
- `details`: validation errors or additional context (optional)

## Status Codes

| Code | When |
|---|---|
| `200` | Successful read or action |
| `201` | Resource created |
| `204` | Successful delete (no body) |
| `400` | Validation error (bad input) |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `429` | Rate limited |
| `500` | Unexpected server error |

## Validation

Validate **every** request body with Zod before processing:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  fileType: z.enum(["pdf", "md", "txt", "url"]),
  sourceUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const body = (await request.json()) as unknown;
  const result = createDocumentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, fileType, sourceUrl } = result.data;
  // proceed with validated data...
}
```

### Validation Rules

- Define schemas in `src/lib/validations/` and import them into route handlers
- Reuse schemas between API validation and form validation (client-side)
- Validate path params (`[id]`) — check they're valid UUIDs or expected formats
- Validate query params for GET requests with pagination/filters

## Authentication

Use Clerk middleware + per-route auth checks:

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // userId is now guaranteed to be a string
}
```

### Auth Rules

- All `/api/` routes except `/api/webhooks/` require authentication
- Always scope data queries to the authenticated user: `WHERE userId = ?`
- Never trust client-sent `userId` — always use `auth().userId`
- Webhook routes verify signatures instead of Clerk auth

## Server Actions vs API Routes

| Use Case | Approach |
|---|---|
| Form submissions (mutations with redirect) | Server Actions |
| Streaming responses (chat) | API Routes |
| File uploads (multipart/form-data) | API Routes |
| Webhook receivers | API Routes |
| Simple CRUD from client components | API Routes (via TanStack Query) |
| Server Component data fetching | Direct Prisma calls (no API route needed) |

### Server Action Conventions

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.document.delete({
    where: { id: documentId, userId },
  });

  revalidatePath("/library");
}
```

## Rate Limiting

Rate limiting strategy for free-tier external APIs:

| Service | Limit | Strategy |
|---|---|---|
| Gemini Flash | 10 RPM, 250 RPD | Queue requests, show "please wait" |
| Voyage AI | Generous free tier | Batch embeddings (max 128 per call) |
| Vercel Blob | Per-plan limits | Client-side file size validation |

Implement rate limiting at the application level:
- Track request counts per user in memory or database
- Return `429` with `Retry-After` header when exceeded
- Show user-friendly messages on the client

## Error Handling Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const data = createDocumentSchema.parse(body);

    const document = await prisma.document.create({
      data: { ...data, userId },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Streaming (Chat Endpoint)

Use Vercel AI SDK for streaming responses:

```typescript
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  // auth + validation...

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages,
    system: systemPrompt,
  });

  return result.toDataStreamResponse();
}
```

## Anti-Patterns

- Never return raw Prisma errors to the client
- Never trust client-side data without server-side validation
- Never use `GET` for mutations or side effects
- Never hardcode status codes as numbers without context — use descriptive comments
- Never skip auth checks on any non-webhook route
- Never log sensitive data (passwords, tokens, full request bodies with PII)
