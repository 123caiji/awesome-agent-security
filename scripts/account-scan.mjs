#!/usr/bin/env node
/**
 * 账号健康扫描：把 123caiji 名下所有仓库体检一遍，产出
 *   reports/account-health.md   人看的报告
 *   reports/account-health.json 机器读的结论（workflow 用它决定要不要开 issue）
 *
 * 用法：
 *   GH_TOKEN=... node scripts/account-scan.mjs          # 写报告
 *   GH_TOKEN=... node scripts/account-scan.mjs --check  # 只检查，有阻塞项时 exit 1
 *
 * 注意：只用 /users/:owner/repos 这类公开接口，所以在 GitHub Actions 里用
 * 内置 GITHUB_TOKEN 也能跑（GITHUB_TOKEN 不是用户 token，/user 系列接口不可用）。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const OWNER = process.env.SCAN_OWNER || '123caiji'
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
const CHECK_ONLY = process.argv.includes('--check')
const API = 'https://api.github.com'

// 阈值：低于这个活跃度/超过这个体积就进"需要处理"
const STALE_DAYS = 90
const BIG_SIZE_KB = 51200 // 50 MB

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'account-scan',
  'x-github-api-version': '2022-11-28',
  ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
}

async function api(path) {
  const res = await fetch(API + path, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET ${path} -> ${res.status} ${text.slice(0, 200)}`)
  }
  return { json: await res.json(), link: res.headers.get('link') || '' }
}

async function paginate(path) {
  const out = []
  let page = 1
  for (;;) {
    const sep = path.includes('?') ? '&' : '?'
    const { json } = await api(`${path}${sep}per_page=100&page=${page}`)
    if (!Array.isArray(json) || json.length === 0) break
    out.push(...json)
    if (json.length < 100) break
    page += 1
    if (page > 10) break
  }
  return out
}

const days = ms => Math.floor(ms / 86400000)
const since7d = new Date(Date.now() - 7 * 86400000).toISOString()
const now = new Date()
const fmtDate = d => (d ? String(d).slice(0, 10) : '—')

async function countCommitsSince(fullName) {
  try {
    const { json } = await api(`/repos/${fullName}/commits?since=${since7d}&per_page=100`)
    return Array.isArray(json) ? json.length : 0
  } catch {
    return -1 // 拿不到（空仓库/权限）
  }
}

// GitHub 的 repo.size 字段在历史被重写后会滞后很久（要等服务端 GC），
// 所以体积偏大时再取一次当前分支的 HEAD 树大小做交叉验证：
// HEAD 很小说明只是历史残留，不该再报阻塞。
async function headSizeKB(fullName, branch) {
  try {
    const { json } = await api(`/repos/${fullName}/git/trees/${encodeURIComponent(branch)}?recursive=1`)
    if (!Array.isArray(json.tree)) return null
    return Math.round(json.tree.reduce((sum, x) => sum + (x.size || 0), 0) / 1024)
  } catch {
    return null
  }
}

async function main() {
  const [profile, repos] = await Promise.all([
    api(`/users/${OWNER}`).then(r => r.json),
    paginate(`/users/${OWNER}/repos?type=owner&sort=pushed`),
  ])

  const own = repos.filter(r => !r.fork).sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
  const forks = repos.filter(r => r.fork).sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))

  const ownRows = []
  for (const repo of own) {
    const commits7d = await countCommitsSince(repo.full_name)
    ownRows.push({
      name: repo.name,
      url: repo.html_url,
      language: repo.language || '—',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      issues: repo.open_issues_count,
      sizeKB: repo.size,
      pushedAt: repo.pushed_at,
      staleDays: days(now - Date.parse(repo.pushed_at)),
      license: repo.license?.spdx_id || null,
      description: repo.description || '',
      hasWiki: Boolean(repo.has_wiki),
      commits7d,
      archived: Boolean(repo.archived),
      isProfile: repo.name === OWNER,
      defaultBranch: repo.default_branch,
    })
  }

  const openThreads = []
  for (const repo of own) {
    if (!repo.open_issues_count) continue
    let items = []
    try {
      const { json } = await api(`/repos/${repo.full_name}/issues?state=open&per_page=100`)
      if (Array.isArray(json)) items = json
    } catch {
      items = []
    }
    for (const item of items) {
      openThreads.push({
        repo: repo.name,
        number: item.number,
        kind: item.pull_request ? 'PR' : 'issue',
        title: item.title,
        author: item.user?.login || '—',
        ageDays: days(now - Date.parse(item.created_at)),
        url: item.html_url,
      })
    }
  }
  openThreads.sort((a, b) => b.ageDays - a.ageDays)

  const blocking = []
  const suggestions = []
  for (const r of ownRows) {
    if (r.archived) continue
    if (!r.isProfile && !r.license) {
      blocking.push({ repo: r.name, problem: '缺少许可证', advice: '选择一个 OSI 许可（MIT / Apache-2.0）并加上 LICENSE 文件' })
    } else if (!r.isProfile && r.license === 'NOASSERTION') {
      suggestions.push({ repo: r.name, problem: '许可证未被 GitHub 识别', advice: '用了自定义或 CC 类许可时可忽略；想统一成 MIT / Apache-2.0 就换掉 LICENSE' })
    }
    if (r.sizeKB > BIG_SIZE_KB) {
      // 先看 HEAD 实际内容：历史重写后 size 字段会滞后
      if (r.headKB === undefined) r.headKB = await headSizeKB(`${OWNER}/${r.name}`, r.defaultBranch)
      const headMB = r.headKB === null ? null : (r.headKB / 1024).toFixed(1)
      if (headMB !== null && r.headKB < BIG_SIZE_KB / 2) {
        suggestions.push({
          repo: r.name,
          problem: `体积记录 ${(r.sizeKB / 1024).toFixed(0)} MB，但当前 HEAD 只有 ${headMB} MB`,
          advice: '历史已重写，等 GitHub 服务端回收（可主动联系支持加速），无需再处理',
        })
      } else {
        blocking.push({ repo: r.name, problem: `仓库体积 ${(r.sizeKB / 1024).toFixed(0)} MB`, advice: '清理历史大文件（git filter-repo / BFG），或把二进制移出仓库' })
      }
    }
    if (r.staleDays > STALE_DAYS) {
      blocking.push({ repo: r.name, problem: `${r.staleDays} 天没有推送`, advice: '补一次依赖更新、README 或归档' })
    }
    if (!r.description) suggestions.push({ repo: r.name, problem: '没有仓库简介', advice: '补一句话简介，GitHub 搜索与推荐会用到' })

  }

  for (const t of openThreads) {
    if (t.ageDays > 14) {
      suggestions.push({ repo: t.repo, problem: `${t.kind} #${t.number} 已挂 ${t.ageDays} 天`, advice: '回复、处理或关闭，维护节奏比数量更重要' })
    }
  }

  // Wiki 默认开启但基本没人用：点名到具体仓库，否则报告里的计数无法落地
  for (const r of ownRows.filter(row => row.hasWiki)) {
    if (r.isProfile) continue
    suggestions.push({ repo: r.name, problem: 'Wiki 开着但仓库里没有 Wiki 内容', advice: '仓库 Settings → Features 取消勾选 Wiki（或 gh api -X PATCH repos/123caiji/' + r.name + ' -F has_wiki=false）' })
  }

  const totals = {
    repos: repos.length,
    own: own.length,
    forks: forks.length,
    stars: ownRows.reduce((s, r) => s + r.stars, 0),
    openIssues: ownRows.reduce((s, r) => s + r.issues, 0),
    active7d: ownRows.filter(r => r.commits7d > 0).length,
    commits7d: ownRows.filter(r => r.commits7d > 0).reduce((s, r) => s + r.commits7d, 0),
    wikiOn: ownRows.filter(r => r.hasWiki).length,
    blocking: blocking.length,
    suggestions: suggestions.length,
  }

  // 与上一次扫描结果对比，给出趋势（数据来源是仓库里已提交的上一份 json）
  let previous = null
  try {
    previous = JSON.parse(readFileSync(join(process.cwd(), 'reports', 'account-health.json'), 'utf8'))
  } catch {
    previous = null
  }
  let trend = null
  if (previous && previous.totals) {
    const before = previous.totals
    const tracked = [
      ['repos', '公开仓库'],
      ['stars', '自有仓库 star'],
      ['openIssues', '未关闭 issue/PR'],
      ['active7d', '近 7 天活跃仓库'],
      ['commits7d', '近 7 天提交'],
      ['blocking', '阻塞项'],
      ['suggestions', '建议项'],
    ]
    trend = {
      since: previous.generatedAt || null,
      changes: tracked.map(([key, label]) => {
        const old = typeof before[key] === 'number' ? before[key] : null
        return { key, label, before: old, after: totals[key], delta: old === null ? null : totals[key] - old }
      }),
    }
  }

  const md = []
  md.push(`# 账号健康报告 · ${OWNER}`)
  md.push('')
  md.push(`> 自动生成于 ${now.toISOString()}（UTC）· 由 .github/workflows/account-scan.yml 每日扫描，请勿手改`)
  md.push('')
  md.push('## 概览')
  md.push('')
  md.push('| 指标 | 数值 |')
  md.push('| --- | --- |')
  md.push(`| 公开仓库 | ${totals.repos}（自有 ${totals.own} / fork ${totals.forks}） |`)
  md.push(`| 自有仓库 star 合计 | ${totals.stars} |`)
  md.push(`| 自有仓库未关闭 issue/PR | ${totals.openIssues} |`)
  md.push(`| 近 7 天有推送的仓库 | ${totals.active7d} / ${totals.own} |`)
  md.push(`| 近 7 天提交数 | ${totals.commits7d} |`)
  if (totals.wikiOn > 0) md.push(`| 开着但未使用的 Wiki | ${totals.wikiOn} 个仓库（GitHub 默认开启，建议关掉） |`)
  md.push(`| 待处理（阻塞） | ${totals.blocking} |`)
  md.push(`| 待处理（建议） | ${totals.suggestions} |`)
  md.push('')

  if (trend && trend.changes.some(c => c.delta)) {
    md.push(`## 较上一次扫描（${String(trend.since || '').slice(0, 10) || '—'}）`)
    md.push('')
    md.push('| 指标 | 上次 | 现在 | 变化 |')
    md.push('| --- | --- | --- | --- |')
    for (const c of trend.changes) {
      const delta = c.delta === null ? '—' : c.delta > 0 ? `+${c.delta}` : c.delta < 0 ? `${c.delta}` : '持平'
      md.push(`| ${c.label} | ${c.before === null ? '—' : c.before} | ${c.after} | ${delta} |`)
    }
    md.push('')
  }

  md.push('## 待处理')
  md.push('')
  if (blocking.length === 0 && suggestions.length === 0) {
    md.push('🎉 没有需要处理的问题。')
  } else {
    if (blocking.length) {
      md.push('### 阻塞项')
      md.push('')
      md.push('| 仓库 | 问题 | 建议 |')
      md.push('| --- | --- | --- |')
      for (const b of blocking) md.push(`| ${b.repo} | ${b.problem} | ${b.advice} |`)
      md.push('')
    }
    if (suggestions.length) {
      md.push('### 建议')
      md.push('')
      md.push('| 仓库 | 问题 | 建议 |')
      md.push('| --- | --- | --- |')
      for (const s of suggestions) md.push(`| ${s.repo} | ${s.problem} | ${s.advice} |`)
      md.push('')
    }
  }

  if (openThreads.length) {
    md.push('## 未关闭的 issue / PR')
    md.push('')
    md.push('| 仓库 | 类型 | 标题 | 作者 | 挂了多久 |')
    md.push('| --- | --- | --- | --- | --- |')
    for (const t of openThreads) {
      md.push(`| ${t.repo} | [${t.kind} #${t.number}](${t.url}) | ${t.title.replace(/\|/g, '\\|')} | ${t.author} | ${t.ageDays} 天 |`)
    }
    md.push('')
  }

  md.push('## 自有仓库')
  md.push('')
  md.push('| 仓库 | 语言 | ★ | Fork | Issue/PR | 记录体积 | HEAD 体积 | 近 7 天提交 | 最后推送 | 许可 |')
  md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const r of ownRows) {
    const size = r.sizeKB >= 1024 ? `${(r.sizeKB / 1024).toFixed(0)} MB` : `${r.sizeKB} KB`
    const headSize = r.headKB === undefined || r.headKB === null ? '—' : r.headKB >= 1024 ? `${(r.headKB / 1024).toFixed(1)} MB` : `${r.headKB} KB`
    md.push(`| [${r.name}](${r.url}) | ${r.language} | ${r.stars} | ${r.forks} | ${r.issues} | ${size} | ${headSize} | ${r.commits7d < 0 ? '—' : r.commits7d} | ${fmtDate(r.pushedAt)} | ${r.license || '缺失'} |`)
  }
  md.push('')

  md.push('## Fork')
  md.push('')
  md.push('| 仓库 | 最后推送 | 状态 |')
  md.push('| --- | --- | --- |')
  for (const r of forks) {
    const d = days(now - Date.parse(r.pushed_at))
    md.push(`| [${r.name}](${r.html_url}) | ${fmtDate(r.pushed_at)} | ${d > STALE_DAYS ? `${d} 天未动` : '有更新'} |`)
  }
  md.push('')
  md.push(`_统计口径：GitHub 公开 API 的 /users/${OWNER}/repos。阻塞阈值：无许可证、体积 > ${BIG_SIZE_KB / 1024} MB、超过 ${STALE_DAYS} 天无推送；体积会再用当前 HEAD 的树大小交叉校验，历史已重写但 GitHub 记录滞后的仓库只算建议项。_`)
  md.push('')

  if (CHECK_ONLY) {
    console.log(`blocking=${totals.blocking} suggestions=${totals.suggestions} active7d=${totals.active7d}/${totals.own}`)
    process.exit(totals.blocking > 0 ? 1 : 0)
  }

  const outDir = join(process.cwd(), 'reports')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'account-health.md'), md.join('\n'), 'utf8')
  writeFileSync(
    join(outDir, 'account-health.json'),
    JSON.stringify({ generatedAt: now.toISOString(), owner: OWNER, profile: { followers: profile.followers, publicRepos: profile.public_repos }, totals, trend, blocking, suggestions, openThreads,
    own: ownRows, forks: forks.map(r => ({ name: r.name, url: r.html_url, pushedAt: r.pushed_at })) }, null, 2) + '\n',
    'utf8',
  )
  console.log(`wrote reports/account-health.md — 自有 ${totals.own} / fork ${totals.forks}，近 7 天提交 ${totals.commits7d}，待处理 ${totals.blocking} 阻塞 + ${totals.suggestions} 建议`)
}

main().catch(error => {
  console.error('account-scan failed:', error)
  process.exit(2)
})
