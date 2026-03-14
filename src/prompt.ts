import { createInterface } from 'node:readline'

/** Prompt the user for a simple y/N confirmation. */
export async function confirm(message: string): Promise<boolean> {
  // Default to "no" in non-interactive environments such as pipes.
  if (!process.stdin.isTTY) {
    return false
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<boolean>((resolve) => {
    rl.question(`${message} (y/N) `, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}
