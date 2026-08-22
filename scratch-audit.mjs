import { spawn } from 'child_process'
import fs from 'fs'

const pages = [
  { path: '/', name: 'landing' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' }
]

async function runLighthouse(url, formFactor, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      'lighthouse',
      url,
      '--chrome-flags=--headless',
      `--form-factor=${formFactor}`,
      '--output=json',
      `--output-path=${outputPath}`
    ]
    if (formFactor === 'desktop') {
      args.push('--screenEmulation.disabled')
      args.push('--throttling.rttMs=40')
      args.push('--throttling.throughputKbps=10240')
      args.push('--throttling.cpuSlowdownMultiplier=1')
    }
    const proc = spawn('npx', args, { shell: true })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Lighthouse failed with code ${code}`))
    })
  })
}

async function auditAll() {
  for (const page of pages) {
    for (const form of ['mobile', 'desktop']) {
      const out = `./audit-${page.name}-${form}.json`
      console.log(`Auditing ${page.name} (${form})...`)
      await runLighthouse(`http://127.0.0.1:4173${page.path}`, form, out)
      const data = JSON.parse(fs.readFileSync(out, 'utf8'))
      console.log(`=== ${page.name} (${form}) ===`)
      Object.keys(data.categories).forEach(k => {
        console.log(`  ${k}: ${Math.round(data.categories[k].score * 100)}`)
      })
    }
  }
}

auditAll().catch(console.error)
