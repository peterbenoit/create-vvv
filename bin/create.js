#!/usr/bin/env node
import * as p from '@clack/prompts'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = path.join(__dirname, '..', 'template')
const TEMPLATE_ROUTER_DIR = path.join(__dirname, '..', 'template-router')

/**
 * Recursively copy a directory.
 * Files whose names start with '_' are renamed to start with '.' at the
 * destination — this is necessary because npm strips dotfiles (e.g.
 * .gitignore) from published packages, so we store them as _gitignore.
 */
function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true })
	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const srcPath = path.join(src, entry.name)
		const destName = entry.name.startsWith('_')
			? `.${entry.name.slice(1)}`
			: entry.name
		const destPath = path.join(dest, destName)
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath)
		} else {
			fs.copyFileSync(srcPath, destPath)
		}
	}
}

function run(cmd, cwd) {
	try {
		execSync(cmd, { cwd, stdio: 'pipe' })
		return true
	} catch {
		return false
	}
}

async function main() {
	console.log()
	p.intro('  create-vvv  —  Vercel + Vite + Vue  ')

	const argName = process.argv[2]
	const isDot = argName === '.'

	const answers = await p.group(
		{
			projectName: () =>
				isDot
					? Promise.resolve('.')
					: p.text({
						message: 'Project name',
						placeholder: 'my-vvv-app',
						initialValue: argName ?? '',
						validate(v) {
							if (!v || v.trim().length === 0) return 'Project name is required'
							if (!/^[a-z0-9][a-z0-9._-]*$/.test(v.trim()))
								return 'Use lowercase letters, numbers, hyphens, or dots'
						},
					}),
			useRouter: () =>
				p.confirm({ message: 'Add Vue Router?', initialValue: false }),
			addDaisyUI: () =>
				p.confirm({ message: 'Add DaisyUI?', initialValue: false }),
			initGit: () =>
				p.confirm({ message: 'Initialize a git repository?', initialValue: true }),
		},
		{
			onCancel() {
				p.cancel('Operation cancelled.')
				process.exit(0)
			},
		}
	)

	const { projectName, useRouter, addDaisyUI, initGit } = answers
	const targetDir =
		projectName === '.' ? process.cwd() : path.resolve(process.cwd(), projectName)
	const displayName =
		projectName === '.' ? path.basename(targetDir) : projectName

	// Guard: refuse to clobber a non-empty directory
	if (
		fs.existsSync(targetDir) &&
		projectName !== '.' &&
		fs.readdirSync(targetDir).length > 0
	) {
		p.cancel(`"${projectName}" already exists and is not empty.`)
		process.exit(1)
	}

	const s = p.spinner()

	// ── Copy template files ────────────────────────────────────────────────
	s.start('Copying template files')
	copyDir(TEMPLATE_DIR, targetDir)
	if (useRouter) copyDir(TEMPLATE_ROUTER_DIR, targetDir)
	s.stop('Template files copied')

	// ── Patch generated package.json ─────────────────────────────────────
	const pkgPath = path.join(targetDir, 'package.json')
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
	pkg.name = displayName
	if (useRouter) pkg.dependencies['vue-router'] = '^4.4.0'
	if (addDaisyUI) pkg.dependencies['daisyui'] = '^5.0.0'
	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

	// ── Patch style.css for DaisyUI ───────────────────────────────────────
	if (addDaisyUI) {
		const stylePath = path.join(targetDir, 'src', 'style.css')
		fs.writeFileSync(stylePath, '@import "tailwindcss";\n@plugin "daisyui";\n')
	}

	// ── Git init (must come before npm install so Husky can attach hooks) ─
	if (initGit) {
		s.start('Initializing git repository')
		const ok = run('git init', targetDir)
		s.stop(ok ? 'Git repository initialized' : 'git init failed — run it manually')
	}

	// ── Install dependencies ───────────────────────────────────────────────
	s.start('Installing dependencies (this may take a moment)')
	const installed = run('npm install', targetDir)
	s.stop(installed ? 'Dependencies installed' : 'npm install failed — run it manually')

	// ── Husky git hooks ───────────────────────────────────────────────────
	if (initGit && installed) {
		s.start('Configuring Husky pre-commit hook')
		const huskyOk = run('npx husky init', targetDir)
		if (huskyOk) {
			const preCommit = path.join(targetDir, '.husky', 'pre-commit')
			fs.writeFileSync(
				preCommit,
				'#!/usr/bin/env sh\nnpx prettier --write .\ngit add .\n'
			)
			try {
				fs.chmodSync(preCommit, 0o755)
			} catch {
				// chmod not available on Windows — safe to ignore
			}
		}
		s.stop(
			huskyOk
				? 'Husky pre-commit hook configured'
				: 'Husky setup failed — run npx husky init manually'
		)
	}

	// ── Initial commit ────────────────────────────────────────────────────
	if (initGit) {
		s.start('Creating initial commit')
		run('git add .', targetDir)
		const committed = run('git commit -m "Initial commit"', targetDir)
		s.stop(committed ? 'Initial commit created' : 'git commit failed — commit manually')
	}

	// ── Done ──────────────────────────────────────────────────────────────
	const cdStep = projectName !== '.' ? `  cd ${projectName}\n` : ''
	p.outro(
		`Project ready! Next steps:\n\n${cdStep}  npm run dev         # Vite dev server\n  npx vercel dev      # Vite + API routes\n`
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
