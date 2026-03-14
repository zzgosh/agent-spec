import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import type { GlobalConfig, ProjectConfig } from './types.ts'

const GLOBAL_DIR = join(homedir(), '.agents')
const GLOBAL_CONFIG_PATH = join(GLOBAL_DIR, 'config.json')
const PROJECT_CONFIG_NAME = '.agents.json'

/** Get the global AGENTS.md path. */
export function getGlobalAgentsPath(): string {
  return join(GLOBAL_DIR, 'AGENTS.md')
}

/** Get the global config directory. */
export function getGlobalDir(): string {
  return GLOBAL_DIR
}

/** Get the project-level config path. */
export function getProjectConfigPath(): string {
  return join(process.cwd(), PROJECT_CONFIG_NAME)
}

/** Get the project-level AGENTS.md path. */
export function getProjectAgentsPath(): string {
  return join(process.cwd(), 'AGENTS.md')
}

/** Read global config. */
export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const raw = await readFile(GLOBAL_CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as GlobalConfig
  } catch {
    return null
  }
}

/** Write global config. */
export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  await mkdir(GLOBAL_DIR, { recursive: true })
  await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n')
}

/** Read project config. */
export async function readProjectConfig(): Promise<ProjectConfig | null> {
  try {
    const raw = await readFile(getProjectConfigPath(), 'utf-8')
    return JSON.parse(raw) as ProjectConfig
  } catch {
    return null
  }
}

/** Write project config. */
export async function writeProjectConfig(config: ProjectConfig): Promise<void> {
  await writeFile(getProjectConfigPath(), JSON.stringify(config, null, 2) + '\n')
}
