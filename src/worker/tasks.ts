import { tasks } from '@/tasks'

export async function ejecutarTareas() {
	console.log(`[worker] Ejecutando ${tasks.length} tareas...`)

	const results = await Promise.allSettled(tasks.map((task) => task()))

	results.forEach((result, index) => {
		if (result.status === 'fulfilled') {
			console.log(`[worker] Task ${index + 1} completada:`, result.value)
		} else {
			console.error(`[worker] Task ${index + 1} falló:`, result.reason)
		}
	})

	return results
}
