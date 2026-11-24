# Contributing

Branches and workflow are shared across the HAWConnect repositories (see `docs/development.md` in the app repository):

- `main` is production, `dev` is staging. Never push to them directly or force-push them.
- Branch from `dev`: `feature/*`, `fix/*`, `refactor/*`; urgent production fixes use `hotfix/*` from `main` and are merged back into `dev`.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `feat!:` for breaking changes). Releases are created from `main` by Release Please.
- Open pull requests into `dev`; CI must pass before merging.
