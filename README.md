# Awesome AI Agent Security & DSH

<div align="center">

**AI Agent 安全 · DeepSeek Harness 生态 · 代码审计 —— 精选清单**

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
![entries](https://img.shields.io/badge/entries-36-2f81f7)
![updated](https://img.shields.io/badge/auto--refreshed-daily-3fb950)

</div>

> 这份清单收录我在 GitHub 上实际用过 / 读过的 AI Agent 安全与 DeepSeek Harness（DSH）生态项目。
> 条目按 ★ 排序，星数与简介**每天由 GitHub Actions 自动刷新**（见 [`.github/workflows/update-index.yml`](.github/workflows/update-index.yml)），不需要人工维护。

## 这是什么

- **不是**爬虫堆出来的"awesome 大全"，而是按"能不能直接用"筛过一遍的短清单。
- 每个条目尽量写明**它是干什么用的**，而不是复述仓库名。
- 全部原始项目保留在上游仓库；本仓库只做索引与导航。

## 目录

- [1. AI 安全与红队工具](#1-ai-安全与红队工具)
- [2. DeepSeek Harness 插件生态](#2-deepseek-harness-插件生态)
- [3. 代码审计与安全学习](#3-代码审计与安全学习)
- [4. 我的项目](#4-我的项目)
- [怎么读这份清单](#怎么读这份清单)
- [自动更新机制](#自动更新机制)
- [账号自动体检](#账号自动体检)

## 1. AI 安全与红队工具

> 授权测试 / AI Agent 安全评估方向的工具链，覆盖 MCP 编排、密钥扫描、CTF、LLM 攻防评测。

<!-- INDEX:START AI 安全与红队工具 -->
| 项目 | ★ | 语言 | 简介 |
| --- | --- | --- | --- |
| [AutoRedTeam-Orchestrator](https://github.com/Coff0xc/AutoRedTeam-Orchestrator) | 268 | Python | MCP 原生的安全自动化工作台，SDK + CLI + MCP 三件套，把授权测试从侦察一路编排到报告。 |
| [Github-API-scan](https://github.com/Coff0xc/Github-API-scan) | 85 | Python | 多平台 AI 密钥泄露扫描与可用性验证（23 个平台），带 Web Dashboard 与 Docker 一键部署。 |
| [catchclaw](https://github.com/Coff0xc/catchclaw) | 32 | Rust | Rust 实现的多平台 AI Agent 安全评估，覆盖 OpenClaw / Dify / FastGPT / LobeChat / NextChat。 |
| [CTF-MCP](https://github.com/Coff0xc/CTF-MCP) | 31 | Python | 126 个 CTF 工具的 MCP 服务器，让 Agent 直接上手 Web / Crypto / Pwn。 |
| [LLM-Security-Assessment-Framework](https://github.com/Coff0xc/LLM-Security-Assessment-Framework) | 24 | Python | FORGEDAN：6 类攻击方法 + 18 项指标的 LLM 安全评测框架。 |
| [coffee-skill](https://github.com/Coff0xc/coffee-skill) | 16 | Python | 开箱即用的 AgentSkills 工作流包（开发 / RAG / API / 数据处理 / Office 产物）。 |
| [Hexstrike-ai-6.2](https://github.com/Coff0xc/Hexstrike-ai-6.2) | 13 | Python | HexStrike 社区分支，强化了 MCP 集成与工具链。 |
| [AgentRed](https://github.com/Coff0xc/AgentRed) | 9 | TypeScript | TypeScript 写的 AI 红队工作台：任务编排、证据追踪、可交付报告。 |
| [vero](https://github.com/Coff0xc/vero) | 7 | Go | Go 写的证据驱动自主红队 Agent，面向授权渗透测试。 |
<!-- INDEX:END AI 安全与红队工具 -->

## 2. DeepSeek Harness 插件生态

> DSH / Cordis 插件与配套工具。DSH 是这套 Agent 框架，插件通过 `cordis.patch.yml` 挂进 profile。

<!-- INDEX:START DeepSeek Harness 插件生态 -->
| 项目 | ★ | 语言 | 简介 |
| --- | --- | --- | --- |
| [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 266853 | TypeScript | DSH Agent 框架本体：一切皆插件（Cordis 插件体系 + profile 组合 + Web 客户端），下面这些插件都挂在它上面。 |
| [dsh-recommend](https://github.com/zp-home/dsh-recommend) | 22 | JavaScript | DSH 生态里最热的插件发现面板，用来筛选值得装的插件。 |
| [dsh-weixin-clawbot](https://github.com/zp-home/dsh-weixin-clawbot) | 3 | JavaScript | 把微信接入 DeepSeek Harness 的桥接插件。 |
| [dsh-dev-sandbox](https://github.com/zp-home/dsh-dev-sandbox) | 2 | TypeScript | 给 DSH 会话加隔离沙箱的开发插件。 |
| [architecture-open-source-research](https://github.com/zp-home/architecture-open-source-research) | 1 | Python | Evidence-led open-source architecture research, technology selection, codebase analysis, and im… |
| [astah-diagram-automation](https://github.com/zp-home/astah-diagram-automation) | 1 | PowerShell | 根据需求自动生成asta 类图时序图等文件可直接生成 asta文件 |
| [orbit-token-widget](https://github.com/zp-home/orbit-token-widget) | 1 | PowerShell | Windows 桌面常驻的 token 用量气泡：数字底下烧着一排火焰，火势由实时 token 消耗速率驱动。纯 PowerShell + WinForms。 |
| [pc-space-cleanup](https://github.com/zp-home/pc-space-cleanup) | 1 | PowerShell | Claude Code skill: Windows C/D 盘空间整理 —— 体检、清缓存、CloudDrive2 上云逐文件校验、云端整理 |
| [skillhub-publish-optimizer](https://github.com/zp-home/skillhub-publish-optimizer) | 1 | PowerShell | Automated Skill validation, packaging, GitHub release handoff, and SkillHub publishing workflow. |
| [dsh-best-dev-optimizer](https://github.com/zp-home/dsh-best-dev-optimizer) | 0 | TypeScript | 面向 DSH 插件开发流程的优化器。 |
| [dsh-plugin-registry](https://github.com/zp-home/dsh-plugin-registry) | 0 | JavaScript | DSH 插件注册表 / 索引基础设施。 |
| [dsh-skill-adapter](https://github.com/zp-home/dsh-skill-adapter) | 0 | JavaScript | 把 Skills 适配进 DSH 运行时的插件。 |
| [kb-graph](https://github.com/zp-home/kb-graph) | 0 | HTML | 把 markdown 知识库渲染成可交互 3D 关系图。单个 HTML，无后端，数据不离开浏览器。 |
<!-- INDEX:END DeepSeek Harness 插件生态 -->

## 3. 代码审计与安全学习

> 代码审计 Skills、学习型靶场与实验项目。

<!-- INDEX:START 代码审计与安全学习 -->
| 项目 | ★ | 语言 | 简介 |
| --- | --- | --- | --- |
| [chronos](https://github.com/well-lzz/chronos) | 2 | Go | Go 写的安全实验/调度项目。 |
| [Bad-Guy](https://github.com/well-lzz/Bad-Guy) | 1 | Python | 红队练习靶场与工具集。 |
| [Code-Audit](https://github.com/well-lzz/Code-Audit) | 1 | — | 成体系的代码审计 Skills 集合，可直接作为 Agent 的审计知识库。 |
| [cyber-psyche](https://github.com/well-lzz/cyber-psyche) | 1 | JavaScript | 攻击者视角的心理/行为建模小项目。 |
| [term3-lab](https://github.com/well-lzz/term3-lab) | 1 | Python | 终端安全实验环境。 |
<!-- INDEX:END 代码审计与安全学习 -->

## 4. 我的项目

> 我自己的开源项目，欢迎 issue / PR。

<!-- INDEX:START 我的项目 -->
| 项目 | ★ | 语言 | 简介 |
| --- | --- | --- | --- |
| [AI-LLM-Agent-Learning](https://github.com/123caiji/AI-LLM-Agent-Learning) | 8 | Python | LLM / Agent 学习路线与笔记（RAG、MCP、LangGraph、提示工程）。 |
| [dsh-memory-toolkit](https://github.com/123caiji/dsh-memory-toolkit) | 4 | TypeScript | 给 Agent 加长期记忆与知识图谱的 DSH 插件（图记忆 + 向量检索 + token 优化）。 |
| [security-research-toolkit](https://github.com/123caiji/security-research-toolkit) | 2 | Python | Web 安全研究工具箱：侦察、SQLi/SSRF/XSS 验证脚本与 CTF 记录。 |
| [stm32-iot-smart-home](https://github.com/123caiji/stm32-iot-smart-home) | 2 | C | STM32 + LoRa + FreeRTOS 的环境监测智能家居毕业设计。 |
| [wulao](https://github.com/123caiji/wulao) | 1 | — | AI / 大模型学习笔记。 |
| [123caiji.github.io](https://github.com/123caiji/123caiji.github.io) | 0 | CSS | 个人技术博客（Jekyll + GitHub Pages）。 |
| [dsh-live](https://github.com/123caiji/dsh-live) | 0 | JavaScript | DSH 会话现场驾驶舱：当前在做什么、要不要人管、本轮花了多少 token。 |
| [kangyang-digital-twin](https://github.com/123caiji/kangyang-digital-twin) | 0 | Vue | 康养数字孪生可视化（Vue + 3D）。 |
| [ai-world](https://github.com/123caiji/ai-world) | 0 | JavaScript | 纯 GitHub Actions 的 AI 情报雷达：20 个公开源 + GitHub 四榜 + 插件 diff，产出静态站与 RSS，零依赖零成本。 |
<!-- INDEX:END 我的项目 -->

## 怎么读这份清单

1. **先看 AI 安全那一节**：如果只读一个，从 [AutoRedTeam-Orchestrator](https://github.com/Coff0xc/AutoRedTeam-Orchestrator) 开始——它是 MCP 原生的编排层，其余工具都能塞进它的工具链。
2. **做 Agent 安全评估**：`catchclaw`（多平台 Agent 侦察）→ `LLM-Security-Assessment-Framework`（模型侧评测）→ `CTF-MCP`（能力验证）。
3. **装 DSH 插件**：先用 `dsh-recommend` 找插件，再按 `dsh-plugin-registry` 的规范装；沙箱类需求看 `dsh-dev-sandbox`。
4. **读源码学安全**：`Code-Audit` 是成体系的审计 Skills，适合当 Agent 的审计知识库。

## 自动更新机制

```text
.github/workflows/update-index.yml   每天 03:17 UTC 跑一次
  ├─ scripts/refresh-stars.mjs       用 GitHub API 拉每个仓库的最新 star / 语言 / 简介 → data/index.json
  └─ scripts/render.mjs              按章节渲染表格 → 写回 README 的 <!-- INDEX:START ... --> 区块
```

- 表格区块由脚本生成，**手改会被下一次自动提交覆盖**；要加项目请改 `data/index.json` 并提 PR。
- 本地预览：`node scripts/render.mjs`。

## 账号自动体检

清单刷新之外，仓库还承担整个账号的日常巡检：

```text
.github/workflows/account-scan.yml   每天 02:43 UTC 跑一次
  └─ scripts/account-scan.mjs        扫 123caiji 名下全部公开仓库 → reports/account-health.md / .json
```

- 检查项：缺许可证、仓库体积 > 50 MB、超过 90 天没推送、issue/PR 挂了太久、默认开启却没用的 Wiki、近 7 天提交数、未关闭 issue 数。
- 有阻塞项时会自动开一个带 `account-health` 标签的 issue，之后每天**更新同一个 issue**，不刷屏。
- 本地跑：`node scripts/account-scan.mjs`（需要 `GH_TOKEN`），或 `node scripts/account-scan.mjs --check` 只检查不写文件。
- 每天两次自动提交（03:17 刷新清单星数 + 02:43 体检报告），仓库不会长时间停更。

## 来源与致谢

条目来源：

- [Coff0xc](https://github.com/Coff0xc) — AI 安全 / 红队工具
- [zp-home](https://github.com/zp-home) — DeepSeek Harness 插件生态
- [well-lzz](https://github.com/well-lzz) — 代码审计与安全学习
- [123caiji](https://github.com/123caiji) — 我的项目

所有内容版权归原作者所有，本仓库仅做导航；如需移除条目请提 issue。

## License

本仓库的索引与文档以 [MIT](LICENSE) 授权，被索引项目各自遵循其原始许可。
