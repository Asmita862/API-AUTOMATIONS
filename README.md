# API Automation Framework (Playwright + TypeScript + GraphQL)

This is a Playwright + TypeScript framework for automating GraphQL API tests.  
It supports environment-based configuration, global setup/teardown, and reusable API services.

---

## Folder Structure

```
api-automation/
├── tests/
│   ├── auth/
│   │   └── login.spec.ts
│   └── admin/
│       └── admin.spec.ts
├── services/
│   └── admin.service.ts
├── global-setup.ts
├── global-teardown.ts
├── playwright.config.ts
├── .env
└── package.json
```

## Setup Instructions

1. Clone the repository:

```bash
git clone <repo-url>
cd api-automation
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

```env
API_BASE_URL={base_url}
ADMIN_EMAIL={email}
ADMIN_PASSWORD={password}
```

4. Run tests:

```bash
npx playwright test {path to test}
```
