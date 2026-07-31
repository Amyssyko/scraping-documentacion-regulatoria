import { logger } from '@/utils/logger'
import { cron } from 'bun'
import { ejecutarWorker } from './utils/worker-runner'

async function ejecutarTareas() {
	return Promise.allSettled([
		ejecutarWorker(
			new URL('./worker/seps-resoluciones.worker.ts', import.meta.url)
		),
		ejecutarWorker(new URL('./worker/bce-tasas.worker.ts', import.meta.url))
	])
}

async function ejecutarProceso() {
	try {
		logger.info('Iniciando proceso de scraping de tasas del Banco Central')
		const resultados = await ejecutarTareas()

		for (const resultado of resultados) {
			if (resultado.status === 'rejected') {
				logger.error(resultado.reason)
			}
		}

		logger.success('Procesos completados')
	} catch (error) {
		logger.error(error instanceof Error ? error.message : 'Error desconocido')
	} finally {
		await logger.flush()
	}
}

cron('0 13 * * 1-5', async () => {
	await ejecutarProceso()
})
