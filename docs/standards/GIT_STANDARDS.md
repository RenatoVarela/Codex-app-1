# Git Standards — The Codex

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Purpose |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructuring (no feature or fix) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `perf` | Performance improvement |

### Scopes

`auth`, `library`, `chat`, `rag`, `upload`, `ui`, `db`, `api`, `config`, `docs`

### Rules

- Description in lowercase, imperative mood: "add feature" not "added feature" or "adds feature"
- Max 72 characters for the subject line
- Body is optional — use it for context on **why**, not what
- Reference issues when relevant: `fixes #12`

### Examples

```
feat(rag): add semantic chunking with overlap
fix(chat): handle empty response from Gemini
docs(standards): add API error format convention
refactor(lib): extract Voyage client to dedicated module
test(rag): add unit tests for chunking function
chore(deps): update Next.js to 16.x
perf(search): batch pgvector queries to reduce round trips
```

## Branching Strategy

```
main ─────────────────────────────────────────────── (production-ready)
  └── feat/upload-pipeline ──── commits ──── PR ──→ merge
  └── fix/chat-empty-response ── commits ── PR ──→ merge
  └── chore/update-deps ──────── commits ── PR ──→ merge
```

| Branch | Purpose | Naming |
|---|---|---|
| `main` | Production-ready code | — |
| `feat/*` | New features | `feat/document-upload` |
| `fix/*` | Bug fixes | `fix/chat-streaming-error` |
| `chore/*` | Maintenance | `chore/update-dependencies` |
| `refactor/*` | Code restructuring | `refactor/rag-pipeline` |

### Rules

- Branch from `main`, merge back to `main`
- Keep branches short-lived (1-3 days)
- Rebase on `main` before merging to keep history clean
- Delete branches after merge

## Pull Requests

### Title

Same format as commits: `type(scope): description`

### Description Template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- List of meaningful changes

## Test Plan
- [ ] How this was tested
- [ ] Edge cases considered
```

### Rules

- One logical change per PR — don't bundle unrelated changes
- PR must pass lint (`npm run lint`) before merge
- Keep PRs small (under 400 lines changed when possible)
- Squash merge to keep `main` history clean

## .gitignore

Ensure these are always ignored:

```
node_modules/
.next/
.env
.env.local
.env.*.local
*.tsbuildinfo
coverage/
playwright-report/
test-results/
.vercel/
```

Never commit:
- `.env` files (secrets, API keys)
- `node_modules/`
- Build artifacts (`.next/`, `out/`)
- IDE-specific files (`.idea/`, `.vscode/settings.json` with personal settings)
- OS files (`.DS_Store`, `Thumbs.db`)
