export default async function handler(req, res) {
	try {
		const response = await fetch('https://jsonplaceholder.typicode.com/posts')
		if (!response.ok) throw new Error(`Upstream error: ${response.status}`)

		const posts = await response.json()
		const sample = posts.slice(0, 10)
		const random = sample[Math.floor(Math.random() * sample.length)]

		res.setHeader('Content-Type', 'application/json')
		res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
		res.end(JSON.stringify({ message: random.title }))
	} catch {
		res.statusCode = 500
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Failed to fetch data' }))
	}
}
