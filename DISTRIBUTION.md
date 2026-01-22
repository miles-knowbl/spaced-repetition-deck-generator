# Distribution

This document describes how to access and use the Spaced Repetition Deck Generator.

## Distribution Methods

- [x] **Tarball**: `spaced-repetition-deck-generator-0.1.0.tgz`
- [ ] **Git**: GitHub repository (requires `gh` CLI - see below)
- [x] **Hosted**: Vercel deployment

---

## For Recipients

### Option 1: Use Hosted Version

Visit the deployed application (requires Vercel account access):

```
https://spaced-repetition-deck-generator-mau8tt0q0.vercel.app
```

Note: You'll need to configure your own `OPENAI_API_KEY` environment variable in Vercel settings for AI generation to work.

### Option 2: Download Tarball

1. Extract the tarball:
   ```bash
   tar -xzf spaced-repetition-deck-generator-0.1.0.tgz
   cd spaced-repetition-deck-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

### Option 3: Clone from Git (Manual Setup)

Until the GitHub repository is created, you can initialize git from the tarball:

```bash
# Extract tarball first
tar -xzf spaced-repetition-deck-generator-0.1.0.tgz
cd spaced-repetition-deck-generator

# Git is already initialized with history
git log --oneline
```

To create a GitHub repository (requires [GitHub CLI](https://cli.github.com/)):

```bash
# Install gh CLI if needed
# macOS: brew install gh
# Other: https://cli.github.com/manual/installation

# Authenticate
gh auth login

# Create repo (choose public or private)
gh repo create spaced-repetition-deck-generator --public --source=. --push
```

---

## Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI card generation |

Get an API key from: https://platform.openai.com/api-keys

---

## Tarball Verification

To verify the tarball integrity:

```bash
# Check SHA256 checksum
echo "4404f1c837483bbdee9446477e9658a4d6cfe7c7bc662f1c993a06d970b6fb7b  spaced-repetition-deck-generator-0.1.0.tgz" | shasum -a 256 -c
```

Tarball size: ~127KB

---

## Production Build

To create a production build:

```bash
npm run build
npm run start
```

---

## Deployment Notes

### Vercel
- Automatically configured via `vercel` CLI
- Set `OPENAI_API_KEY` in Project Settings → Environment Variables
- Uses sql.js (WebAssembly SQLite) for serverless compatibility

### Other Platforms
The app should work on any platform supporting Node.js 18+:
- Netlify
- Railway
- Render
- Docker (create your own Dockerfile)

---

## Version

- Version: 0.1.0
- Created: 2026-01-22
- Node.js: 18+
