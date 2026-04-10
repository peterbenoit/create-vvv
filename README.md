# create-vvv

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=flat-square&logo=vercel)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)

Scaffold a modern Vue 3 project with Vite, Tailwind CSS v4, Pinia, and Vercel serverless API routes — in one command. No bash required, works on any platform.

<p align="center">
  <img src="https://raw.githubusercontent.com/peterbenoit/vvv-init/main/screenshots/preview.png" alt="Project Preview" width="600">
</p>

## Usage

```bash
npm create vvv@latest my-project
# or with a name prompt
npm create vvv@latest
```

You'll be walked through:
1. **Project name** (or pass it as an argument)
2. **Vue Router** — optional multi-page support
3. **DaisyUI** — optional component library (Tailwind v4-compatible)
4. **Git init** — initializes a repo with an initial commit

## What you get

```
my-project/
├── api/
│   └── hello.js          # Example Vercel serverless function
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── App.vue            # Root component
│   ├── main.js            # App entry (Vue + Pinia + @unhead/vue)
│   └── style.css          # @import "tailwindcss"
├── .env                   # VITE_API_BASE and private vars
├── .gitignore
├── eslint.config.js       # ESLint v9 flat config
├── index.html
├── package.json
├── vercel.json
└── vite.config.js         # Vite + @tailwindcss/vite plugin + vitest
```

With Vue Router selected, `src/router.js` and `src/pages/` are added.

## Stack

| Layer | Tech |
|---|---|
| Framework | Vue 3 + Composition API |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| State | Pinia |
| Head / SEO | `@unhead/vue` |
| API routes | Vercel serverless functions |
| Linting | ESLint v9 flat config + `eslint-plugin-vue` |
| Formatting | Prettier (config in `package.json`) |
| Git hooks | Husky v9 (pre-commit: Prettier + re-stage) |
| Testing | Vitest + `@vue/test-utils` |

## Environment variables

```
VITE_PUBLIC_MESSAGE=Hello from the frontend   # exposed to browser
VITE_API_BASE=/api                             # API base path
PRIVATE_BACKEND_SECRET=replace-this-secret    # server-only
```

## Commands (in generated project)

```bash
npm run dev          # Vite dev server
npx vercel dev       # Vite + API routes locally
npm run build        # Production build
npm test             # Vitest
npm run lint         # ESLint
npm run format       # Prettier
```

## Publishing

```bash
# Dry run — check what gets included
npm pack --dry-run

# Publish
npm publish --access public
```

## Author

[Peter Benoit](https://peterbenoit.com)

## License

MIT

