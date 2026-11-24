# HAWConnect Console

<img src="public/favicon.svg" alt="HAWConnect logo" width="88" />

[![Lint](https://github.com/hawconnect/hawconnect-console/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/hawconnect/hawconnect-console/actions/workflows/lint.yml)
[![Version](https://img.shields.io/github/package-json/v/hawconnect/hawconnect-console/main?label=version)](package.json)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-40296C.svg)](#getting-started)

**The admin console for HAWConnect, the campus app for students of HAW Hamburg — built by students, for students.** Staff and student organisers use it to publish announcements, events, clubs and links in the app, moderate the marketplace and manage access ([console.hawconnect.de](https://console.hawconnect.de)).

> HAWConnect is an independent, student-maintained project. It is not an official service of HAW Hamburg.

## Contents

- [Features](#features)
- [How the project is organised](#how-the-project-is-organised)
- [Getting started](#getting-started)
- [Everyday commands](#everyday-commands)
- [Testing](#testing)
- [Configuration, content and deployment](#configuration-content-and-deployment)
- [Getting help](#getting-help)
- [Contributing and maintainers](#contributing-and-maintainers)
- [Contributors](#contributors)
- [License](#license)

## Features

| Area | What you get |
| --- | --- |
| **Announcements** | Bilingual announcements with scheduling, audience and platform targeting, and images. |
| **Campus Life events** | Events from student organisers and their organiser profiles, published in the app's campus feed. |
| **Clubs** | The club directory with rich German and English descriptions and images. |
| **Quick Links** | The app's bilingual link directory: titles, URLs, icons, order and visibility. |
| **Marketplace** | Review posts and reports, and manage blocks. |
| **Operations** | Status of the public sources the backend reads (menus, events, news, dates). |
| **Access** | Delegated permissions, protected bootstrap grants and a paginated audit log. |
| **Interface** | German and English, light and dark themes, responsive navigation. |

Every privileged action is checked by the backend. Student calendars, private calendar links and account secrets never appear in the console. Legal texts are maintained on [hawconnect.de](https://hawconnect.de/en/legal/privacy), not here.

## How the project is organised

HAWConnect is split into four repositories. This one is the console.

| Repository | Folder | What it is |
| --- | --- | --- |
| [hawconnect/hawconnect-app](https://github.com/hawconnect/hawconnect-app) | `hawconnect` | Expo app for iOS, Android and web |
| [hawconnect/hawconnect-backend](https://github.com/hawconnect/hawconnect-backend) | `hawconnect-backend` | GraphQL/REST API, accounts and sign-in site, PostgreSQL, public-source ingestion |
| [hawconnect/hawconnect-console](https://github.com/hawconnect/hawconnect-console) | `hawconnect-console` | **This repository** — admin console for staff and organisers |
| [hawconnect/hawconnect-docs](https://github.com/hawconnect/hawconnect-docs) | `hawconnect-website` | Landing page, documentation and legal pages ([hawconnect.de](https://hawconnect.de)) |

The console has no database of its own: its server functions call the backend's `/api/admin`, and admins sign in through the shared sign-in site.

**Tech stack:** [TanStack Start](https://tanstack.com/start) and TanStack Router, React, Tailwind CSS, TipTap, Vite, [Bun](https://bun.sh), Biome.

```text
src/
├── routes/          # Pages (TanStack Router); _app/ holds the signed-in area
├── components/      # Reusable UI
├── lib/             # Server functions, auth, storage and translations
└── routeTree.gen.ts # Generated — do not edit
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) **1.4.2** (see [`.bun-version`](.bun-version))
- A running [backend](https://github.com/hawconnect/hawconnect-backend) with accounts and the sign-in site configured

### 1. Clone and install

```bash
mkdir HAWConnect && cd HAWConnect
git clone https://github.com/hawconnect/hawconnect-console.git
git clone https://github.com/hawconnect/hawconnect-backend.git
cd hawconnect-console
bun install --frozen-lockfile
```

### 2. Configure

```bash
cp .env.example .env.local
```

```dotenv
APP_URL=http://localhost:43127
SESSION_SECRET=REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
HAWCONNECT_ADMIN_API_URL=http://localhost:4000/api/admin
HAWCONNECT_LOGIN_URL=http://account.localhost:4000
```

The backend needs matching settings and your email address in its admin list; see [docs/configuration.md](docs/configuration.md). Never commit secrets.

### 3. Run

```bash
bun dev           # http://localhost:43127
```

Open `http://localhost:43127/login` and sign in with an account that has console access.

## Everyday commands

| Command | What it does |
| --- | --- |
| `bun dev` | Start the development server on port 43127 |
| `bun run build` | Production build |
| `bun start` | Run the production build |
| `bun run generate-routes` | Regenerate `src/routeTree.gen.ts` |
| `bun run typecheck` | Type-check |
| `bun run lint` | Biome (formatting and lint) |
| `bun test` | Unit tests |
| `bun run docker:build` | Build the Docker image |

## Testing

Unit tests run with `bun test` and use local fixtures, including an injected storage transport for image uploads; they never touch a live bucket, database or mail server. Passing them does not prove a deployment works, so check sign-in, uploads and permissions on your own deployment.

## Configuration, content and deployment

| Topic | Read |
| --- | --- |
| Local and backend settings, R2 image storage, Coolify deployment | [docs/configuration.md](docs/configuration.md) |
| Clubs, Quick Links, marketplace moderation, access and maintenance | [docs/content.md](docs/content.md) |
| Backend migrations the console depends on | the backend's [docs/database.md](https://github.com/hawconnect/hawconnect-backend/blob/main/docs/database.md) |
| Branches, staging checklist and releases | the app's [docs](https://github.com/hawconnect/hawconnect-app/tree/main/docs) |

## Getting help

- **Bugs and ideas:** open an issue in [GitHub Issues](https://github.com/hawconnect/hawconnect-console/issues).
- **Security problems:** please report privately as described in the app's [security policy](https://github.com/hawconnect/hawconnect-app/blob/main/.github/SECURITY.md).
- **Contact:** contact@hawconnect.de

## Contributing and maintainers

HAWConnect is maintained by students at HAW Hamburg, and contributions are welcome — code, translations, bug reports and ideas.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the project conventions in [AGENTS.md](AGENTS.md).
2. Branch from `dev` (`feature/…`, `fix/…`), use [Conventional Commits](https://www.conventionalcommits.org/), and open a pull request into `dev`.
3. Please follow the [Code of Conduct](https://github.com/hawconnect/hawconnect-app/blob/main/.github/CODE_OF_CONDUCT.md).

## Contributors

HAWConnect is built by many contributors. GitHub keeps the current list for each repository:

- [App](https://github.com/hawconnect/hawconnect-app/graphs/contributors)
- [Backend](https://github.com/hawconnect/hawconnect-backend/graphs/contributors)
- [Console](https://github.com/hawconnect/hawconnect-console/graphs/contributors)
- [Docs](https://github.com/hawconnect/hawconnect-docs/graphs/contributors)

Want to join? See [Contribute](https://hawconnect.de/en/docs/contribute/contribute).

## License

HAWConnect is free software under the [GNU Affero General Public License v3.0](LICENSE).

### Source attribution

HAWConnect contains code adapted from the upstream Neuland campus application ecosystem, maintained by Neuland Ingolstadt e.V. Original copyright and licence notices in the incorporated source remain applicable. HAWConnect is independently maintained and does not claim upstream endorsement.
