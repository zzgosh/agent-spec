import { access } from 'node:fs/promises'
import pc from 'picocolors'
import {
  getGlobalAgentsPath,
  readGlobalConfig,
  writeGlobalConfig,
} from '../config.ts'
import { detectInstalledAgents } from '../agents.ts'
import { linkAgents, printLinkResults } from '../linker.ts'

interface LinkOptions {
  yes?: boolean
}

export async function linkCommand(options: LinkOptions): Promise<void> {
  const config = await readGlobalConfig()
  const agentsPath = getGlobalAgentsPath()

  // Check whether the canonical source file exists.
  try {
    await access(agentsPath)
  } catch {
    console.error(pc.red(`${agentsPath} does not exist`))
    console.error(pc.dim(`Install it first with ${pc.bold('agent-specs add <url> -g')}`))
    process.exit(1)
  }

  console.log(pc.dim('Detecting installed agent clients...'))
  const agents = await detectInstalledAgents()

  if (agents.length === 0) {
    console.log(pc.yellow('No installed agent clients detected'))
    return
  }

  console.log(`Detected ${agents.length} agent client(s):\n`)

  const results = await linkAgents(agents, agentsPath, {
    yes: options.yes,
  })
  printLinkResults(results)

  // Update linkedAgents in config.
  if (config) {
    await writeGlobalConfig({
      ...config,
      linkedAgents: results
        .filter((r) => r.status !== 'skipped')
        .map((r) => r.agent.name),
    })
  }

  console.log(pc.green('\nDone!'))
}
