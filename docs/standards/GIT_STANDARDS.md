# Git Standards — The Codex

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

### Scopes
- `auth`, `library`, `chat`, `rag`, `upload`, `ui`, `db`, `api`, `config`, `docs`

### Examples
```
feat(rag): add semantic chunking with overlap
fix(chat): handle empty response from Gemini
docs(standards): add API error format convention
refactor(lib): extract Voyage client to dedicated module
test(rag): add unit tests for chunking function
chore(deps): update Next.js to 15.x
```

## Branching Strategy

- `main` — production-ready code
- `feat/<feature-name>` — feature branches
- `fix/<bug-description>` — bug fix branches
- `chore/<task>` — maintenance tasks

## Pull Requests
<!-- TODO: Define PR template, review checklist -->
