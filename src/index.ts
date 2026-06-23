import main from '@/task/tasas-bce'
import { logger } from '@/utils/logger'
import { cron } from 'bun'

cron('0 13 * * 1-5', async () => {
	logger.info('Ejecutando tarea...')
	await main()
	logger.info('Tarea completada.')
})
