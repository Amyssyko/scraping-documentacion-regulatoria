import { logger } from '@/utils/logger'
import { cron } from 'bun'
import { ejecutarWorker } from './utils/worker-runner'

async function ejecutarTareas() {
  const resultados = await Promise.allSettled([
    ejecutarWorker(
      new URL('./worker/seps-resoluciones.worker.ts', import.meta.url)
    ),

    ejecutarWorker(new URL('./worker/bce-tasas.worker.ts', import.meta.url))
  ])

  return resultados
}

await ejecutarTareas()

cron('0 13 * * 1-5', async () => {
  try {
    await ejecutarTareas()

    logger.success('Procesos completados')
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    await logger.flush()
  }
})
