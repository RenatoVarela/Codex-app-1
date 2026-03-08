# Testing Standards — The Codex

## Test Pyramid

```
       /\
      /E2E\          ← Few (critical user flows only)
     /______\
    /        \
   /Integration\    ← Medium (API routes, DB queries)
  /____________\
 /              \
/   Unit Tests   \  ← Many (lib, utils, hooks, stores)
/________________\
```

**Target ratio:** 70% unit / 20% integration / 10% E2E

## Tools

| Tool | Purpose | Config |
|---|---|---|
| Vitest | Unit + integration tests | `vitest.config.ts` |
| Playwright | E2E tests | `playwright.config.ts` |
| Testing Library | React component testing | `@testing-library/react` |

## File Naming

| Type | Pattern | Location |
|---|---|---|
| Unit tests | `*.test.ts` / `*.test.tsx` | Co-located next to source file |
| Integration tests | `*.integration.test.ts` | `tests/integration/` |
| E2E tests | `*.spec.ts` | `tests/e2e/` |

Co-locate unit tests with source files:

```
src/lib/rag/
  chunking.ts
  chunking.test.ts       ← right next to the source
src/hooks/
  use-upload.ts
  use-upload.test.tsx
```

## Unit Testing (Vitest)

### What to Test

| Priority | Module | Why |
|---|---|---|
| High | `lib/rag/*` | Core pipeline — chunking, retrieval, scoring |
| High | `lib/validations/*` | Zod schemas — boundary validation |
| High | `lib/parsers/*` | Text extraction logic |
| Medium | `stores/*` | Zustand state transitions |
| Medium | `hooks/*` | Custom hook behavior |
| Medium | `lib/utils/*` | Formatting, helpers |
| Low | `components/*` | Only test complex interaction logic |

### Writing Tests

Use the **Arrange-Act-Assert** pattern:

```typescript
import { describe, it, expect } from "vitest";
import { chunkText } from "./chunking";

describe("chunkText", () => {
  it("should split text into chunks within max token limit", () => {
    // Arrange
    const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    const options = { maxTokens: 50, overlap: 0.1 };

    // Act
    const chunks = chunkText(text, options);

    // Assert
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.tokenCount).toBeLessThanOrEqual(50);
    });
  });

  it("should preserve metadata for each chunk", () => {
    const text = "# Section One\n\nContent here.";
    const chunks = chunkText(text, { maxTokens: 500 });

    expect(chunks[0].sectionTitle).toBe("Section One");
    expect(chunks[0].position).toBe(0);
  });

  it("should handle empty text gracefully", () => {
    const chunks = chunkText("", { maxTokens: 500 });
    expect(chunks).toEqual([]);
  });
});
```

### Test Naming

Use descriptive names that read as sentences:

```typescript
// BAD
it("test1", () => { ... });
it("works", () => { ... });

// GOOD
it("should return empty array when text is empty", () => { ... });
it("should throw when maxTokens is negative", () => { ... });
it("should apply overlap between adjacent chunks", () => { ... });
```

### Mocking Strategy

Mock external services, never internal logic:

```typescript
import { vi, describe, it, expect } from "vitest";

// Mock external API clients
vi.mock("@/lib/clients/voyage", () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1024).fill(0)),
  rerankChunks: vi.fn().mockImplementation((chunks) => chunks),
}));

// Mock Prisma
vi.mock("@/lib/clients/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((args) => ({ id: "mock-id", ...args.data })),
    },
  },
}));
```

**Rules:**
- Mock at the boundary (API clients, database, file system)
- Never mock the module under test
- Use `vi.fn()` for function mocks, `vi.mock()` for module mocks
- Reset mocks between tests: `afterEach(() => vi.restoreAllMocks())`

### Zustand Store Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState(useUIStore.getInitialState());
  });

  it("should toggle sidebar", () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
```

## Integration Testing

### API Route Tests

Test the full request → response cycle:

```typescript
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/documents/route";
import { NextRequest } from "next/server";

describe("POST /api/documents", () => {
  it("should return 400 for invalid body", async () => {
    const request = new NextRequest("http://localhost/api/documents", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("should return 401 when not authenticated", async () => {
    const request = new NextRequest("http://localhost/api/documents", {
      method: "POST",
      body: JSON.stringify({ title: "Test", fileType: "pdf" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
```

## E2E Testing (Playwright)

### What to Test

Only critical user flows:
1. **Auth flow** — sign in, sign out, redirect to library
2. **Upload flow** — upload document, see processing, see ready state
3. **Chat flow** — ask question, see streaming response, see citations
4. **Library flow** — view documents, search, delete

### Writing E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Document Upload", () => {
  test("should upload a PDF and display it in the library", async ({ page }) => {
    await page.goto("/library");

    // Click upload button
    await page.getByRole("button", { name: /upload/i }).click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("tests/fixtures/sample.pdf");

    // Wait for processing
    await expect(page.getByText("Processing")).toBeVisible();

    // Verify document appears in library
    await expect(page.getByText("sample.pdf")).toBeVisible({ timeout: 30000 });
  });
});
```

### Selectors (Priority Order)

1. `getByRole()` — accessible role queries (best)
2. `getByLabel()` — form elements
3. `getByText()` — visible text
4. `getByTestId()` — last resort (use `data-testid` attribute)

### Test Data

- Keep fixtures in `tests/fixtures/` (sample PDFs, MD files, text files)
- Use small files (<1MB) for fast tests
- Never use real user data or production credentials

## Coverage

### Targets

| Type | Target |
|---|---|
| Unit tests (lib/, utils/) | 80% |
| Integration (API routes) | 60% |
| E2E (critical flows) | All 4 flows above |

### Running Tests

```bash
# Unit tests
npx vitest run                          # run all once
npx vitest                              # watch mode
npx vitest run src/lib/rag/             # specific directory
npx vitest --coverage                   # with coverage report

# E2E tests
npx playwright test                     # run all
npx playwright test --ui               # interactive mode
npx playwright test tests/e2e/upload   # specific test
```

## Rules

- Each test must be independent — no test should depend on another test's state
- Tests must be deterministic — same input always produces same result
- No `sleep()` or arbitrary timeouts — use proper waiters (`waitFor`, `expect.poll`)
- No real API calls in unit tests — mock external services
- Clean up after tests — reset stores, clear mocks, remove test data
- Test both happy path and error cases
- Test edge cases: empty inputs, boundary values, null/undefined
