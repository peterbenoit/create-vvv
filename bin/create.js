#!/usr/bin/env node
import * as p from '@clack/prompts'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Node version guard ────────────────────────────────────────────────────
const [nodeMajor] = process.versions.node.split('.').map(Number)
if (nodeMajor < 20) {
	console.error(
		`create-vvv requires Node.js 20 or higher.\nYou are running Node.js ${process.versions.node}.\nUpgrade: https://nodejs.org`
	)
	process.exit(1)
}

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

function hasGit() {
	try {
		execSync('git --version', { stdio: 'pipe' })
		return true
	} catch {
		return false
	}
}

/** Detect the package manager that invoked this script. */
function detectPackageManager() {
	const agent = process.env.npm_config_user_agent ?? ''
	if (agent.startsWith('pnpm')) return 'pnpm'
	if (agent.startsWith('yarn')) return 'yarn'
	if (agent.startsWith('bun')) return 'bun'
	return 'npm'
}

/** Return the install command for a given package manager. */
function installCmd(pm) {
	if (pm === 'yarn') return 'yarn'
	if (pm === 'bun') return 'bun install'
	return `${pm} install`
}

/** Return the run command for a given package manager and script. */
function runCmd(pm, script) {
	if (pm === 'yarn') return `yarn ${script}`
	if (pm === 'bun') return `bun run ${script}`
	return `${pm} run ${script}`
}

/** Parse --flags from argv; positional args are not touched. */
function parseFlags(argv) {
	const flags = {
		router: false,
		daisyui: false,
		git: null,        // null = ask
		skipInstall: false,
		yes: false,
	}
	for (const arg of argv) {
		if (arg === '--router') flags.router = true
		if (arg === '--daisyui') flags.daisyui = true
		if (arg === '--git') flags.git = true
		if (arg === '--no-git') flags.git = false
		if (arg === '--skip-install') flags.skipInstall = true
		if (arg === '--yes' || arg === '-y') flags.yes = true
	}
	return flags
}

async function main() {
	const rawArgs = process.argv.slice(2)
	const flags = parseFlags(rawArgs)
	// First non-flag positional argument is the project name
	const argName = rawArgs.find((a) => !a.startsWith('-'))
	const isDot = argName === '.'
	const pm = detectPackageManager()
	const gitAvailable = hasGit()

	console.log()
	p.intro('  create-vvv  —  Vercel + Vite + Vue  ')

	let answers

	if (flags.yes) {
		// Non-interactive: resolve project name then apply defaults for everything else
		let projectName
		if (isDot) {
			projectName = '.'
		} else if (argName) {
			projectName = argName
		} else {
			projectName = await p.text({
				message: 'Project name',
				placeholder: 'my-vvv-app',
				validate(v) {
					if (!v || v.trim().length === 0) return 'Project name is required'
					if (!/^[a-z0-9][a-z0-9._-]*$/.test(v.trim()))
						return 'Use lowercase letters, numbers, hyphens, or dots'
				},
			})
			if (p.isCancel(projectName)) {
				p.cancel('Operation cancelled.')
				process.exit(0)
			}
		}
		answers = {
			projectName,
			useRouter: flags.router,
			addDaisyUI: flags.daisyui,
			initGit: flags.git ?? gitAvailable,
		}
	} else {
		answers = await p.group(
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
					flags.router
						? Promise.resolve(true)
						: p.confirm({ message: 'Add Vue Router?', initialValue: false }),
				addDaisyUI: () =>
					flags.daisyui
						? Promise.resolve(true)
						: p.confirm({ message: 'Add DaisyUI?', initialValue: false }),
				initGit: () => {
					if (flags.git !== null) return Promise.resolve(flags.git)
					if (!gitAvailable) {
						p.log.warn('git not found — skipping repository initialization')
						return Promise.resolve(false)
					}
					return p.confirm({ message: 'Initialize a git repository?', initialValue: true })
				},
			},
			{
				onCancel() {
					p.cancel('Operation cancelled.')
					process.exit(0)
				},
			}
		)
	}

	const { projectName, useRouter, addDaisyUI, initGit } = answers
	const skipInstall = flags.skipInstall
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
	let gitOk = false
	if (initGit) {
		s.start('Initializing git repository')
		gitOk = run('git init', targetDir)
		s.stop(gitOk ? 'Git repository initialized' : 'git init failed — run it manually')
	}

	// ── Install dependencies ───────────────────────────────────────────────
	let installed = false
	if (!skipInstall) {
		s.start(`Installing dependencies via ${pm} (this may take a moment)`)
		installed = run(installCmd(pm), targetDir)
		s.stop(
			installed
				? 'Dependencies installed'
				: `${pm} install failed — run it manually`
		)
	}

	// ── Husky git hooks ───────────────────────────────────────────────────
	if (initGit && gitOk && installed) {
		s.start('Configuring Husky pre-commit hook')
		const huskyOk = run('npx husky init', targetDir)
		if (huskyOk) {
			const preCommit = path.join(targetDir, '.husky', 'pre-commit')
			fs.writeFileSync(
				preCommit,
				'#!/usr/bin/env sh\nnpx prettier --write .\ngit add -u\n'
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
	if (initGit && gitOk) {
		s.start('Creating initial commit')
		run('git add .', targetDir)
		const committed = run('git commit -m "Initial commit"', targetDir)
		s.stop(committed ? 'Initial commit created' : 'git commit failed — commit manually')
	}

	// ── Done: tailored completion message ────────────────────────────────
	const steps = []
	if (projectName !== '.') steps.push(`  cd ${projectName}`)

	// Always show npm install as a step to be safe (even if we ran it)
	steps.push(`  ${installCmd(pm)}   # ensure all dependencies are installed`)
	steps.push(`  ${runCmd(pm, 'dev')}         # start dev server`)
	steps.push(`  ${runCmd(pm, 'build')}       # build for production`)
	if (useRouter) steps.push(`  # Routes live in src/pages/`)
	steps.push(`  # Note: 'vercel dev' has issues with Vite 6 - use 'npm run dev' instead`)

	p.outro(`Project ready! Next steps:\n\n${steps.join('\n')}\n`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
