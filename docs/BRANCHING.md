Branching strategy (moved from repository root)

Goal

- Keep `main` stable and release-ready.
- Use `develop` as the integration branch for feature work.

Flow

1. Create feature/fix branches from `develop` (naming: `feature/desc`, `fix/desc`).
2. Open PRs from feature branches -> `develop` for review and CI.
3. When `develop` is ready, open a PR from `develop` -> `main` (release). Do not open feature -> main PRs.

Rules / naming

- Feature branches: `feature/*`
- Bugfix branches: `fix/*` or `hotfix/*`
- Release branches: `release/*`
- Chores/docs: `chore/*`, `docs/*`

Enforcement

- Local git hooks were removed; CI enforces branch naming and protection rules.
- Before pushing, confirm your branch follows allowed prefixes and is based on `develop`.

Why

- Keeps history readable and safer releases via `develop` testing and integration.
