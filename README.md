# Swagger AI Agent

This repository contains the Phase 1 scaffold for the Swagger AI Agent (Node.js + TypeScript + Express).

Local dev

1. Install dependencies:

```powershell
npm install
```

2. Run in development mode:

```powershell
npm run dev
```

3. Build and run:

```powershell
npm run build
npm start
```

Git / push instructions

This repository is set up locally. To push to GitHub from your machine, prefer using the GitHub CLI (`gh`) or Git Credential Manager. Do NOT paste personal access tokens into shared places or chat.

Example using `gh` (recommended):

```powershell
# authenticate (interactive)
gh auth login

# create a repo on GitHub and push current directory
gh repo create <owner>/<repo> --public --source=. --remote=origin --push
```

If the remote already exists, push with:

```powershell
git add .
git commit -m "chore: scaffold Phase 1 and domain models"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

Security note

- Do NOT paste personal access tokens into chat. If you've accidentally shared a token, revoke it immediately from GitHub > Settings > Developer settings > Personal access tokens, then generate a new one.
- Use `gh auth login` or a credential manager rather than embedding tokens in commands.

Contact

If you want, I can prepare a GitHub Actions workflow, a `CONTRIBUTING.md`, or run additional scaffolding before you push.

## Environment & Quick Start (PowerShell)

Copy `.env.example` to `.env` and customize environment values as needed. Do not commit secrets into source control.

- Env files present in the repo:
	- `.env` — local runtime (copy from `.env.example`)
	- `.env.development` — development settings (debug logging)
	- `.env.test` — test/CI settings
	- `.env.production` — production defaults

- Key vars: `NODE_ENV`, `PORT`, `LOG_LEVEL`, `SPEC_STORAGE`, `DEFAULT_TIMEOUT_MS`

Run locally (PowerShell):
```powershell
# install deps
npm install

# run in development (uses npm script `dev` if available)
npm run dev

# build
npm run build

# run tests
npm test
```

Notes:
- `SPEC_STORAGE=memory` is the default for Phase 3; in-memory repositories are used.
- Use `.env.example` as a template. Keep secrets out of source control.
