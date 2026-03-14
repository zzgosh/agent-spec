# agent-specs

Chinese documentation: [README.zh-CN](https://github.com/zzgosh/agent-specs/blob/main/docs/README.zh-CN.md)

`agent-specs` is a CLI for managing `AGENTS.md` files.

It can fetch `AGENTS.md` from a remote URL and install it either per-project or globally. In global mode, it detects installed AI agent clients on the local machine and symlinks a single shared rules file into each client’s native path so multiple agents can reuse the same source of truth.

The examples in this repository use Vercel's public [agent-skills/AGENTS.md](https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md) as a demo source. The project is inspired by [Vercel Skills CLI](https://github.com/vercel-labs/skills).

## Installation

```bash
# Run directly (recommended)
npx agent-specs <command>

# Or install globally
npm install -g agent-specs
```

## Quick Start

```bash
# Project install: download AGENTS.md into the current directory
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md

# Global install: write to ~/.agents/ and symlink to detected agent clients
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g
```

## Commands

### `agent-specs add <source>`

Install `AGENTS.md` from a remote URL.

```bash
# Project install (default)
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md

# Global install: write to ~/.agents/AGENTS.md and symlink to detected agents
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g

# Skip confirmation and overwrite existing files after backing them up
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g -y
```

Supported URL formats:

| Format | Example |
|------|------|
| GitHub blob URL | `https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md` |
| Short GitHub URL | `https://github.com/vercel-labs/agent-skills/AGENTS.md` |
| Raw URL | `https://raw.githubusercontent.com/vercel-labs/agent-skills/main/AGENTS.md` |
| Any URL | `https://example.com/path/to/AGENTS.md` |

Options:

| Option | Description |
|------|------|
| `-g, --global` | Install globally and symlink to detected agent clients |
| `-y, --yes` | Skip confirmation and automatically back up then overwrite existing files |

### `agent-specs update`

Re-fetch and update `AGENTS.md` from its original source.

```bash
agent-specs update
agent-specs update -g
```

### `agent-specs list`

Show installation and symlink status.

```bash
agent-specs list
agent-specs list -g
```

### `agent-specs link`

Detect agent clients again and recreate symlinks. This is useful after installing a new agent client.

```bash
agent-specs link
agent-specs link -y
```

### `agent-specs remove`

Remove installed `AGENTS.md` files and related symlinks.

```bash
agent-specs remove
agent-specs remove -g
agent-specs remove -g -y
```

## How Global Install Works

```text
~/.agents/AGENTS.md          <- source of truth
    ^ symlink
    |-- ~/.claude/CLAUDE.md
    |-- ~/.gemini/GEMINI.md
    |-- ~/.codex/AGENTS.md
    |-- ~/.config/amp/AGENTS.md
    |-- ~/.config/opencode/AGENTS.md
    |-- ~/.qwen/QWEN.md
    |-- ~/.roo/rules/AGENTS.md
    |-- ~/.continue/rules/AGENTS.md
    |-- ~/.augment/rules/AGENTS.md
    `-- ~/.kiro/steering/AGENTS.md
```

- Editing `~/.agents/AGENTS.md` updates every linked agent immediately.
- Running `agent-specs update -g` refreshes the shared file without recreating symlinks.

## Supported Agent Clients

| Agent | Detection Directory | Symlink Target | Filename |
|-------|---------|-------------|--------|
| Claude Code | `~/.claude/` | `~/.claude/CLAUDE.md` | `CLAUDE.md` |
| Gemini CLI | `~/.gemini/` | `~/.gemini/GEMINI.md` | `GEMINI.md` |
| Codex (OpenAI) | `~/.codex/` | `~/.codex/AGENTS.md` | `AGENTS.md` |
| Amp | `~/.config/amp/` | `~/.config/amp/AGENTS.md` | `AGENTS.md` |
| OpenCode | `~/.config/opencode/` | `~/.config/opencode/AGENTS.md` | `AGENTS.md` |
| Qwen Code | `~/.qwen/` | `~/.qwen/QWEN.md` | `QWEN.md` |
| Roo Code | `~/.roo/` | `~/.roo/rules/AGENTS.md` | `AGENTS.md` |
| Continue | `~/.continue/` | `~/.continue/rules/AGENTS.md` | `AGENTS.md` |
| Augment | `~/.augment/` | `~/.augment/rules/AGENTS.md` | `AGENTS.md` |
| Kiro | `~/.kiro/` | `~/.kiro/steering/AGENTS.md` | `AGENTS.md` |

The CLI only creates symlinks for agent clients that are actually detected on the machine.

## Conflict Handling

| Scenario | Default Behavior | `-y` Behavior |
|------|---------|----------|
| Source of truth already exists | Ask for confirmation | Back up to `.backup` and overwrite |
| Agent path is a symlink | Replace it directly | Replace it directly |
| Agent path is a regular file | Skip and report it | Back up to `.backup` and replace it |

## Development

```bash
npm install
npm run build
npx tsx src/cli.ts --help
node bin/cli.mjs --help
```

## License

[MIT](./LICENSE)
