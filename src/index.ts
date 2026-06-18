import cron from 'node-cron'
import { logger } from './utils/logger.js'
import main from './utils/task.js'

const task = cron.schedule('0 8 * * 1-5', async () => {
	await main()
})
logger.info(`Estado de la tarea: ${task.getStatus()}`) // 'scheduled', 'running', 'stopped'
logger.info(
	`Tarea programada para ejecutarse el ${task.getNextRun()?.toLocaleString()}`
) // e.g. 2026-06-16T15:00:00.000Z
