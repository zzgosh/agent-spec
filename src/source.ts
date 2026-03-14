import type { ParsedSource } from './types.ts'

/**
 * Parse a source URL and normalize it to a fetchable raw URL.
 *
 * Supported formats:
 * - https://github.com/owner/repo/blob/branch/path/to/FILE.md
 * - https://github.com/owner/repo/path/to/FILE.md (tries main first)
 * - https://raw.githubusercontent.com/owner/repo/branch/path
 * - Any other URL (used as-is)
 */
export function parseSource(url: string): ParsedSource {
  // GitHub blob/tree URL: https://github.com/owner/repo/blob/branch-name/path
  // Branch names may contain /, so we split with a lazy branch match plus the trailing file path.
  const blobTreeMatch = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|tree)\/(.+?)\/([^/].*\.[^/]+)$/,
  )
  if (blobTreeMatch) {
    const [, owner, repo, branch, path] = blobTreeMatch
    return {
      type: 'github',
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
      displayUrl: url,
    }
  }

  // Short GitHub URL without blob/tree: https://github.com/owner/repo/path
  const githubMatch = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(.+)$/,
  )
  if (githubMatch) {
    const [, owner, repo, path] = githubMatch
    return {
      type: 'github',
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`,
      displayUrl: url,
      inferredBranch: true,
    }
  }

  // raw.githubusercontent.com or any other URL: use directly.
  return {
    type: 'raw',
    rawUrl: url,
    displayUrl: url,
  }
}

/**
 * Fetch file content from a URL.
 * GitHub shortcut URLs try main first and then fall back to master.
 */
export async function fetchContent(source: ParsedSource): Promise<string> {
  const response = await fetch(source.rawUrl)

  // Only inferred main branches fall back to master on a failed request.
  if (!response.ok && source.inferredBranch) {
    const masterUrl = source.rawUrl.replace('/main/', '/master/')
    const retryResponse = await fetch(masterUrl)
    if (retryResponse.ok) {
      return retryResponse.text()
    }
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file: ${response.status} ${response.statusText}\n  URL: ${source.rawUrl}`,
    )
  }

  return response.text()
}
