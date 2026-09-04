import { ejecutarTareas } from './tasks'

try {
	const results = await ejecutarTareas()

	self.postMessage({
		ok: true,
		data: results
	})
} catch (error) {
	console.error('[worker] Error:', error)

	self.postMessage({
		ok: false,
		error: error instanceof Error ? error.message : String(error)
	})
}
