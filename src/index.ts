import main from '@/task/tasas-bce'
import { logger } from '@/utils/logger'
import cron from 'node-cron'

const task = cron.schedule('* * * * 1-5', async () => {
	await main()
})
logger.info(`Estado de la tarea: ${task.getStatus()}`) // 'scheduled', 'running', 'stopped'
logger.info(
	`Tarea programada para ejecutarse el ${task.getNextRun()?.toLocaleString()}`
) // e.g. 2026-06-16T15:00:00.000Z
