interface HealthCheckResult {
	disponible: boolean
	status: number | null
	tiempoRespuestaMs: number
	error?: string
}

export async function verificarUrl(url: string, timeoutMs = 30000): Promise<HealthCheckResult> {
	const inicio = Date.now()

	try {
		const controller = new AbortController()

		const timeout = setTimeout(() => {
			controller.abort()
		}, timeoutMs)

		const response = await fetch(url, {
			method: 'HEAD',
			signal: controller.signal,
			redirect: 'follow',
			cache: 'no-store',
			referrerPolicy: 'no-referrer',
			referrer: 'no-referrer'
		})

		clearTimeout(timeout)

		return {
			disponible: response.ok,
			status: response.status,
			tiempoRespuestaMs: Date.now() - inicio
		}
	} catch (err: any) {
		return {
			disponible: false,
			status: null,
			tiempoRespuestaMs: Date.now() - inicio,
			error: err.message
		}
	}
}
