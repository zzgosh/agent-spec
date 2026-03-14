import { writeFile, access, mkdir } from 'node:fs/promises'
import pc from 'picocolors'
import { parseSource, fetchContent } from '../source.ts'
import {
  getGlobalAgentsPath,
  getGlobalDir,
  getProjectAgentsPath,
  readGlobalConfig,
  writeGlobalConfig,
  readProjectConfig,
  writeProjectConfig,
} from '../config.ts'
import { detectInstalledAgents } from '../agents.ts'
import { linkAgents, printLinkResults } from '../linker.ts'
import { confirm } from '../prompt.ts'

interface AddOptions {
  global?: boolean
  yes?: boolean
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function addCommand(
  sourceUrl: string,
  options: AddOptions,
): Promise<void> {
  const source = parseSource(sourceUrl)

  console.log(pc.dim(`Source: ${source.displayUrl}`))
  console.log(pc.dim('Fetching content...'))

  let content: string
  try {
    content = await fetchContent(source)
  } catch (err) {
    console.error(pc.red((err as Error).message))
    process.exit(1)
  }

  console.log(pc.green(`Fetched successfully (${content.length} chars)`))

  if (options.global) {
    await addGlobal(sourceUrl, content, options)
  } else {
    await addProject(sourceUrl, content, options)
  }
}

/** Install globally. */
async function addGlobal(
  sourceUrl: string,
  content: string,
  options: AddOptions,
): Promise<void> {
  const agentsPath = getGlobalAgentsPath()
  const globalDir = getGlobalDir()

  // Ensure ~/.agents exists.
  await mkdir(globalDir, { recursive: true })

  // Check whether the target file already exists.
  if (await fileExists(agentsPath)) {
    if (!options.yes) {
      console.log(pc.yellow(`\n${agentsPath} already exists`))
      const ok = await confirm(
        'Overwrite it? The existing file will be backed up as AGENTS.md.backup.',
      )
      if (!ok) {
        console.log(pc.dim('Cancelled'))
        return
      }
    }

    // Back up the existing file.
    const { rename } = await import('node:fs/promises')
    const backupPath = `${agentsPath}.backup`
    await rename(agentsPath, backupPath)
    console.log(pc.dim(`Backed up the existing file to ${backupPath}`))
  }

  // Write the canonical source file.
  await writeFile(agentsPath, content, 'utf-8')
  console.log(pc.green(`\nWrote ${agentsPath}`))

  // Detect installed agent clients.
  console.log(pc.dim('\nDetecting installed agent clients...'))
  const agents = await detectInstalledAgents()

  let linkedAgentNames: string[] = []

  if (agents.length === 0) {
    console.log(pc.yellow('No installed agent clients detected'))
    console.log(
      pc.dim('Run agent-specs link after installing an agent client to create symlinks'),
    )
  } else {
    console.log(`Detected ${agents.length} agent client(s):\n`)

    // Create symlinks.
    const results = await linkAgents(agents, agentsPath, {
      yes: options.yes,
    })
    printLinkResults(results)

    linkedAgentNames = results
      .filter((r) => r.status !== 'skipped')
      .map((r) => r.agent.name)
  }

  // Persist config even when no agent clients are detected.
  const now = new Date().toISOString()
  const existingConfig = await readGlobalConfig()
  await writeGlobalConfig({
    version: 1,
    source: sourceUrl,
    installedAt: existingConfig?.installedAt ?? now,
    updatedAt: now,
    linkedAgents: linkedAgentNames,
  })

  console.log(pc.green('\nDone!'))
}

/** Install in the current project. */
async function addProject(
  sourceUrl: string,
  content: string,
  options: AddOptions,
): Promise<void> {
  const agentsPath = getProjectAgentsPath()

  // Check whether the target file already exists.
  if (await fileExists(agentsPath)) {
    if (!options.yes) {
      console.log(pc.yellow(`\n${agentsPath} already exists`))
      const ok = await confirm('Overwrite it?')
      if (!ok) {
        console.log(pc.dim('Cancelled'))
        return
      }
    }
  }

  await writeFile(agentsPath, content, 'utf-8')
  console.log(pc.green(`\nWrote ${agentsPath}`))

  // Persist project config.
  const now = new Date().toISOString()
  const existingConfig = await readProjectConfig()
  await writeProjectConfig({
    version: 1,
    source: sourceUrl,
    installedAt: existingConfig?.installedAt ?? now,
    updatedAt: now,
  })

  console.log(pc.green('Done!'))
}
