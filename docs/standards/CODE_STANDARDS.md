# Code Standards — The Codex

## TypeScript

### Strict Mode

`tsconfig.json` has `strict: true`. This enables:
- `noImplicitAny` — every value must have a type
- `strictNullChecks` — `null` and `undefined` are distinct types
- `strictFunctionTypes` — function parameter types are checked
- `noUncheckedIndexedAccess` — array/object indexing returns `T | undefined`

### No `any` Policy

`any` is **prohibited** everywhere. No exceptions.

```typescript
// BAD
function parse(data: any) { ... }
const result = response.json() as any;
// @ts-ignore
someUntypedCall();

// GOOD
function parse(data: unknown) { ... }
const result: ApiResponse = await response.json();
const parsed = schema.parse(data); // Zod validates at runtime
```

**At boundaries** (API responses, form data, external libs), use `unknown` + Zod:

```typescript
const body = (await request.json()) as unknown;
const validated = createDocumentSchema.parse(body);
```

### Type Definitions

- Prefer `type` over `interface` (use `interface` only when extending third-party types)
- Zod schemas are the source of truth — derive types from them:

```typescript
const documentSchema = z.object({
  title: z.string().min(1).max(200),
  fileType: z.enum(["pdf", "md", "txt", "url"]),
});

type Document = z.infer<typeof documentSchema>;
```

- Co-locate types with the code that uses them. Only put shared/cross-cutting types in `src/types/`
- Export types explicitly: `export type { Document }` (not re-exported from barrel files)

### Enums

Avoid TypeScript `enum`. Use `as const` objects or Zod enums:

```typescript
// BAD
enum Status { Processing, Ready, Error }

// GOOD
const STATUS = {
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];

// OR with Zod
const statusSchema = z.enum(["processing", "ready", "error"]);
type Status = z.infer<typeof statusSchema>;
```

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase file + export | `BookCard.tsx` → `export function BookCard()` |
| Non-component modules | kebab-case | `api-client.ts`, `use-upload.ts` |
| Routes/pages | kebab-case folders | `app/(dashboard)/library/page.tsx` |
| Functions / variables | camelCase | `getDocumentById`, `isLoading` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_CHUNK_SIZE` |
| Types / Interfaces | PascalCase | `type DocumentChunk`, `type ApiResponse` |
| Zod schemas | camelCase + `Schema` suffix | `createDocumentSchema`, `chatMessageSchema` |
| CSS variables | kebab-case with prefix | `--color-gold`, `--font-playfair` |
| Environment variables | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `VOYAGE_API_KEY` |

### Boolean Naming

Prefix with `is`, `has`, `can`, `should`:

```typescript
const isLoading = true;
const hasDocuments = documents.length > 0;
const canUpload = user.plan === "premium" || documentsCount < 10;
```

### Event Handlers

Prefix with `handle` in components, `on` in props:

```tsx
// In the component that defines the handler
function handleUpload(file: File) { ... }

// In the component's props interface
type Props = { onUpload: (file: File) => void };
```

## Import Order

Organize imports in this order, separated by blank lines:

```typescript
// 1. React / Next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { z } from "zod";
import { motion } from "motion/react";

// 3. Internal absolute imports (@/)
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/queries/use-documents";

// 4. Relative imports
import { BookCard } from "./BookCard";

// 5. Types (type-only imports)
import type { Document } from "@/types/database";
```

## File Structure — React Components

```tsx
// 1. Imports (ordered as above)

// 2. Types (if component-specific, not shared)
type BookCardProps = {
  document: Document;
  onSelect: (id: string) => void;
};

// 3. Component
export function BookCard({ document, onSelect }: BookCardProps) {
  // hooks first
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // derived state
  const formattedDate = formatDate(document.createdAt);

  // handlers
  function handleClick() {
    onSelect(document.id);
  }

  // render
  return ( ... );
}
```

### Rules

- One component per file (small sub-components in the same file are fine if not reused)
- Named exports only — no `export default`
- `"use client"` only when truly needed (hooks, browser APIs, event handlers)
- Keep components under 150 lines. Extract logic into hooks or helpers if larger

## Error Handling

### API Routes

Always return structured errors:

```typescript
try {
  const data = schema.parse(body);
  const result = await doSomething(data);
  return NextResponse.json({ data: result });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  console.error("[API] Unexpected error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### Client Components

Use error boundaries for render errors. For async operations, handle errors in the hook/query level:

```typescript
const { data, error, isLoading } = useDocuments();

if (error) return <ErrorState message="Failed to load documents" />;
if (isLoading) return <LoadingSkeleton />;
if (!data?.length) return <EmptyState />;
```

### Rules

- Never swallow errors silently (`catch (e) {}`)
- Never expose raw error messages to users
- Log errors with context: `console.error("[Module] Description:", error)`
- Use Zod `.safeParse()` when you want to handle errors without try/catch

## Comments

- Write self-documenting code — prefer clear naming over comments
- Only comment **why**, not **what** (the code shows what)
- No commented-out code — use git history
- No obvious comments: `// increment counter` above `counter++`

```typescript
// BAD
// Get the document by ID
const doc = await getDocumentById(id);

// GOOD — explains WHY, not WHAT
// Voyage AI limits batch size to 128, so we chunk the embeddings
const batches = chunkArray(embeddings, 128);
```

## Performance Guidelines

- Prefer Server Components — they render on the server with zero client JS
- Use `React.lazy()` / `next/dynamic` for heavy client components
- Avoid barrel imports (`index.ts` re-exports) — they defeat tree-shaking
- Memoize expensive computations with `useMemo`, not every value
- Use `useCallback` only when passing handlers to memoized children
- Prefer CSS animations over JS-driven animations for simple transitions
- Images: always use `next/image` with explicit `width`/`height`

## Anti-Patterns

- `any` anywhere in the codebase
- `// @ts-ignore` or `// @ts-expect-error` without a ticket/issue reference
- `as` type assertions when Zod validation is possible
- `export default` (use named exports)
- Business logic in components (extract to `lib/` or hooks)
- Mixing server and client concerns in the same file
- Deep nesting (>3 levels of callbacks/conditionals) — extract early returns or helpers
- Magic numbers/strings — use named constants
