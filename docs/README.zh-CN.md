# agent-specs

English README: [README.md](../README.md)

统一管理 `AGENTS.md` 的 CLI 工具。

它可以从远程 URL 获取 `AGENTS.md`，支持项目级安装或全局安装。全局安装时会自动检测本机已安装的 AI agent 客户端，并通过 symlink 将同一份规则文件映射到各客户端的原生路径，实现一份规则文件在多个 agent 间复用。

文档中的演示资源使用 Vercel 的公开仓库 [agent-skills/AGENTS.md](https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md)。灵感来自 [Vercel Skills CLI](https://github.com/vercel-labs/skills)。

## 安装

```bash
# 直接使用（推荐）
npx agent-specs <command>

# 或全局安装
npm install -g agent-specs
```

## 快速开始

```bash
# 项目级：下载 AGENTS.md 到当前目录
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md

# 全局级：下载到 ~/.agents/ 并 symlink 到已检测到的 agent 客户端
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g
```

## 命令

### `agent-specs add <source>`

从远程 URL 安装 `AGENTS.md`。

```bash
# 项目级安装（默认）
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md

# 全局安装：写入 ~/.agents/AGENTS.md，并 symlink 到各 agent
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g

# 跳过确认提示（已有文件时自动备份并覆盖）
agent-specs add https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md -g -y
```

支持的 URL 格式：

| 格式 | 示例 |
|------|------|
| GitHub blob URL | `https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md` |
| GitHub 简化 URL | `https://github.com/vercel-labs/agent-skills/AGENTS.md` |
| Raw URL | `https://raw.githubusercontent.com/vercel-labs/agent-skills/main/AGENTS.md` |
| 任意 URL | `https://example.com/path/to/AGENTS.md` |

选项：

| 选项 | 说明 |
|------|------|
| `-g, --global` | 全局安装，并 symlink 到各 agent 客户端 |
| `-y, --yes` | 跳过确认，自动备份并覆盖已有文件 |

### `agent-specs update`

从原始来源重新拉取并更新 `AGENTS.md`。

```bash
agent-specs update
agent-specs update -g
```

### `agent-specs list`

查看当前安装状态和 symlink 情况。

```bash
agent-specs list
agent-specs list -g
```

### `agent-specs link`

重新检测 agent 客户端并创建 symlink，适用于安装了新 agent 后需要补建链接的场景。

```bash
agent-specs link
agent-specs link -y
```

### `agent-specs remove`

移除已安装的 `AGENTS.md` 及相关 symlink。

```bash
agent-specs remove
agent-specs remove -g
agent-specs remove -g -y
```

## 全局安装工作原理

```text
~/.agents/AGENTS.md          <- truth source
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

- 修改 `~/.agents/AGENTS.md` 后，已链接的 agent 会立即读取到新内容。
- 执行 `agent-specs update -g` 后，所有 symlink 目标会同步到最新内容，无需重新链接。

## 支持的 Agent 客户端

| Agent | 检测目录 | Symlink 目标 | 文件名 |
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

CLI 只会为检测到已安装的 agent 创建 symlink。

## 冲突处理

| 场景 | 默认行为 | `-y` 行为 |
|------|---------|----------|
| truth source 已存在 | 提示确认 | 备份为 `.backup` 后覆盖 |
| agent 路径是 symlink | 直接替换 | 直接替换 |
| agent 路径是普通文件 | 跳过并提示 | 备份为 `.backup` 后替换 |

## Directory Structure

```text
agent-specs/
|-- .github/
|   `-- workflows/
|       |-- ci.yml          # PR 与 main 分支构建检查
|       `-- release.yml     # 手动触发 npm 发布、tag 与 GitHub Release
|-- bin/
|   `-- cli.mjs              # CLI 入口
|-- docs/
|   `-- README.zh-CN.md      # 中文文档
|-- src/
|   |-- commands/
|   |   |-- add.ts           # 安装命令
|   |   |-- link.ts          # 重建 symlink
|   |   |-- list.ts          # 查看安装状态
|   |   |-- remove.ts        # 移除安装与链接
|   |   `-- update.ts        # 从来源重新拉取
|   |-- agents.ts            # Agent 检测与配置
|   |-- cli.ts               # Commander 命令注册
|   |-- config.ts            # 配置文件读写
|   |-- linker.ts            # Symlink 创建 / 替换 / 备份
|   |-- prompt.ts            # 终端确认提示
|   |-- source.ts            # URL 解析与内容获取
|   `-- types.ts             # 类型定义
|-- build.config.mjs         # unbuild 配置
|-- LICENSE                  # MIT 许可
|-- package-lock.json        # npm lockfile
|-- package.json             # 包元数据
|-- README.md                # English documentation
`-- tsconfig.json
```

## 开发

```bash
npm install
npm run build
npx tsx src/cli.ts --help
node bin/cli.mjs --help
```

## License

[MIT](./LICENSE)
