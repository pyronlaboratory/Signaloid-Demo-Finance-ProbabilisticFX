[<img src="https://assets.signaloid.io/add-to-signaloid-cloud-logo-dark-v6.svg#gh-dark-mode-only" alt="[Add to signaloid.io]" height="30"/>](https://signaloid.io/repositories?connect=https://github.com/pyronlaboratory/Signaloid-Demo-Finance-ProbabilisticFX#gh-dark-mode-only)

# Signaloid Probabilistic FX Demo

A lightweight Angular SPA demonstrating probabilistic currency conversion. It models exchange rate uncertainty as continuous distributions and computes the target value via the Signaloid Cloud Compute Engine API.

**Try the live application:** <a href="https://probabilisticfx.vercel.app/" target="_blank" rel="noopener noreferrer">Launch App ↗</a>

## Preview

| Main Dashboard                                 | Result Analysis                               |
| :--------------------------------------------- | :-------------------------------------------- |
| ![Dashboard](./screenshots/Screenshot%201.png) | ![Analysis](./screenshots/Screenshot%202.png) |

## Prerequisites

Ensure the following tools and accounts are installed and configured:

- [Node.js](https://nodejs.org) runtime(v24.x or later) with npm or bun package manager

- [Angular CLI](https://angular.dev/tools/cli) v21.0.0 or higher

- A Signaloid Cloud Developer Platform account. Sign up at [signaloid.io](https://signaloid.io)

- Signaloid CLI (`signaloid-cli`) for local execution. See the [installation guide](https://docs.signaloid.io/docs/api/signaloid-cli/installation/)

## Installation

**Clone the repository**:

```bash
git clone https://github.com/pyronlaboratory/Signaloid-Demo-Finance-ProbabilisticFX

cd Signaloid-Demo-Finance-ProbabilisticFX
```

**Install dependencies**:

```bash
npm install
```

## Configuration

### API Key

1. Obtain your API key from the [Signaloid Cloud Settings](https://signaloid.io/settings/api).

2. Update your key in the `Signaloid` service:
   - **File**: `src/app/services/signaloid.ts`
   - **Field**: `private readonly API_KEY = 'YOUR_API_KEY_HERE';`

### Local Proxy

To bypass CORS during development, the project uses an Angular proxy configuration (`src/proxy.conf.js`) that routes `/api-signaloid` requests to `https://api.signaloid.io`.

## Running the Application

### Default Mode

Uses a pre-compiled Signaloid build ID for faster execution.

1. Build the source code in `src/compute/main.cpp` using the [Signaloid Developer Platform](https://signaloid.io/) or the `signaloid-cli`.

2. Copy the resulting **Build ID** (e.g., `bld_...`).

3. Update the `signaloidBuildId` field in `src/environments/environment.development.ts`.

```bash
npm start
```

### Ephemeral Mode

Compiles the C++ source code (`src/compute/main.cpp`) dynamically at runtime for each session.

```bash
npm run start:ephemeral
```

## Deployment

### Building

```bash
npm run build
```

Artifacts are output to `dist/client/browser`. To verify the build locally before deploying:

```bash
npx serve dist/client/browser -s
```

The `-s` flag enables SPA mode, redirecting all routes to `index.html` so Angular's client-side router works correctly.

---

### Vercel

#### Architecture

The project deploys as two units on Vercel:

- **Angular app** — static output from `dist/client/browser`
- **Proxy server** — `api/signaloid.ts` deployed as a Vercel serverless function

The proxy exists to keep the Signaloid API key server-side and out of the client bundle. All calls from the Angular app to `api.signaloid.io` are routed through it.

```
.
├── api/
│   └── signaloid.ts       # Serverless function (auto-detected by Vercel)
├── src/                   # Angular source code
└── vercel.json            # Routing and rewrite rules
```

Route rewrites are configured in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/signaloid/(.*)",
      "destination": "/api/signaloid"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/"
    }
  ]
}
```

The first rule funnels all `/api/signaloid/*` requests to the serverless function. The second rule sends all non-API routes to the Angular app's `index.html`.

#### Environment Variables

The following must be set in the Vercel project dashboard under **Settings → Environment Variables**:

| Variable             | Description                                 |
| -------------------- | ------------------------------------------- |
| `SIGNALOID_API_KEY`  | Your Signaloid API secret key (`skkc__...`) |
| `SIGNALOID_API_BASE` | Signaloid API hostname (`api.signaloid.io`) |

---

#### Option 1: Vercel Web Dashboard (Manual)

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel auto-detects the Angular framework preset and configures the build command and output directory.
3. Add the environment variables above under **Environment Variables** before deploying.
4. Click **Deploy**.

---

#### Option 2: Vercel CLI

```bash
# Install CLI (first time only)
npm i -g vercel

# Authenticate
vercel login

# Link to your Vercel project (first time only, generates .vercel/project.json)
vercel link

# Deploy to production
vercel --prod
```

---

#### Option 3: GitHub Actions

This approach runs the test suite first and only deploys to Vercel if all tests pass.

**1. Disable Vercel's automatic Git deployments**

Add the following to `vercel.json` to prevent Vercel from deploying independently on every push:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

**2. Create a Vercel token**

Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) and create a token.

**3. Retrieve your project and org IDs**

```bash
vercel link        # links the project, writes .vercel/project.json
cat .vercel/project.json
```

Output:

```json
{
  "orgId": "team_xxxx",
  "projectId": "prj_xxxx"
}
```

**4. Add secrets to GitHub**

Go to your GitHub repository → **Settings → Secrets and variables → Actions** and add following to **Repository secrets**:

| Secret              | Value                                   |
| ------------------- | --------------------------------------- |
| `VERCEL_TOKEN`      | Token from step 2                       |
| `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

**5. Workflow configuration**

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-npm-

      - run: npm ci
      - run: npm test -- --watch=false

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

The `deploy` job only runs on direct pushes to `main` (not on PRs) and only after the `test` job passes.

---

### Hosting the Serverless Function Separately

If you need to host the proxy in a separate repository on a different domain, you must configure CORS in that project's `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://your-angular-app.vercel.app" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/signaloid/:path*",
      "destination": "/api/signaloid"
    }
  ]
}
```

You also need to update `environment.ts` in the Angular project to point to the remote function URL:

```typescript
export const environment = {
  production: true,
  signaloidApiBase: 'https://your-serverless-repo.vercel.app/api/signaloid',
};
```
