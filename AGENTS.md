# Repository Guidelines

## Project Structure & Module Organization

`src/cli.ts` wires the Commander CLI. `src/commands/` contains handlers for `add`, `remove`, `update`, `list`, and `link`. Shared logic lives in `src/agents.ts`, `src/source.ts`, `src/linker.ts`, `src/config.ts`, `src/prompt.ts`, and `src/types.ts`. `bin/cli.mjs` is the published CLI entry and loads the built `dist/cli.mjs`; `dist/` is generated and ignored. `.agents/skills/` stores repository-local release and publishing skill docs, while `docs/` contains localized README content.

## Build, Test, and Development Commands

- `npm ci` - install dependencies exactly from `package-lock.json`.
- `npm run dev -- --help` - run the CLI from `src/cli.ts` through `tsx`.
- `npm run build` - compile the ESM package with `unbuild` into `dist/`.
- `node bin/cli.mjs --help` - smoke-test the packaged CLI entry after building.

There is no `npm test` script. CI runs `npm ci` and `npm run build` on Node.js 18, 20, and 22.

## Coding Style & Naming Conventions

Use TypeScript and ESM only; do not add CommonJS output. Match the existing style: 2-space indentation, single quotes, no semicolons, explicit `.ts` extensions on local imports, and `type` imports for type-only symbols. Use camelCase for variables and functions, PascalCase for TypeScript types, and kebab-case for CLI values and agent IDs such as `claude-code`.

Validate external inputs such as URLs, file paths, and filesystem writes. Fail with clear errors instead of silent fallbacks.

## Testing Guidelines

Until a test framework is added, validate changes with `npm run build` plus focused CLI smoke tests. Run filesystem-mutating commands in a temporary directory, not the repository root, because the CLI may create `.agents.json` and `AGENTS.md`. If adding tests, prefer command-level files such as `src/commands/add.test.ts` and add the matching npm script.

## Commit & Pull Request Guidelines

Git history uses Conventional Commits and merge commits. Use messages such as `feat: add agent detection`, `fix: preserve project AGENTS.md`, or `docs: update release notes`. Create feature branches from `main` and merge through PRs. PRs should include a behavior summary, linked issue when available, validation commands and results, and screenshots only for user-visible docs or CLI output changes.

Releases are published through the manual GitHub Actions `workflow_dispatch` release workflow from `main`.

## Security & Configuration Tips

This CLI can write files, create backups, and manage symlinks in project directories and `~/.agents`. Avoid global-mode experiments against a real home directory unless that is intentional. Do not commit generated or local runtime artifacts such as `dist/`, `node_modules/`, `*.backup`, `.agents.json`, or packed `*.tgz` files.
