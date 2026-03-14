import { homedir } from 'node:os'
import { join } from 'node:path'
import { access } from 'node:fs/promises'
import type { AgentConfig } from './types.ts'

const home = homedir()

/**
 * Supported agent clients with known global rules file locations.
 */
export const SUPPORTED_AGENTS: AgentConfig[] = [
  {
    name: 'claude-code',
    displayName: 'Claude Code',
    detectDir: join(home, '.claude'),
    globalFilePath: join(home, '.claude', 'CLAUDE.md'),
    fileName: 'CLAUDE.md',
  },
  {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    detectDir: join(home, '.gemini'),
    globalFilePath: join(home, '.gemini', 'GEMINI.md'),
    fileName: 'GEMINI.md',
  },
  {
    name: 'codex',
    displayName: 'Codex (OpenAI)',
    detectDir: join(home, '.codex'),
    globalFilePath: join(home, '.codex', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'amp',
    displayName: 'Amp',
    detectDir: join(home, '.config', 'amp'),
    globalFilePath: join(home, '.config', 'amp', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'opencode',
    displayName: 'OpenCode',
    detectDir: join(home, '.config', 'opencode'),
    globalFilePath: join(home, '.config', 'opencode', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'qwen-code',
    displayName: 'Qwen Code',
    detectDir: join(home, '.qwen'),
    globalFilePath: join(home, '.qwen', 'QWEN.md'),
    fileName: 'QWEN.md',
  },
  {
    name: 'roo-code',
    displayName: 'Roo Code',
    detectDir: join(home, '.roo'),
    globalFilePath: join(home, '.roo', 'rules', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'continue',
    displayName: 'Continue',
    detectDir: join(home, '.continue'),
    globalFilePath: join(home, '.continue', 'rules', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'augment',
    displayName: 'Augment',
    detectDir: join(home, '.augment'),
    globalFilePath: join(home, '.augment', 'rules', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
  {
    name: 'kiro',
    displayName: 'Kiro',
    detectDir: join(home, '.kiro'),
    globalFilePath: join(home, '.kiro', 'steering', 'AGENTS.md'),
    fileName: 'AGENTS.md',
  },
]

/** Check whether a directory exists. */
async function dirExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/** Detect installed agent clients. */
export async function detectInstalledAgents(): Promise<AgentConfig[]> {
  const results = await Promise.all(
    SUPPORTED_AGENTS.map(async (agent) => ({
      agent,
      installed: await dirExists(agent.detectDir),
    })),
  )
  return results.filter((r) => r.installed).map((r) => r.agent)
}
