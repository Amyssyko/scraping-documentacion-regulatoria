import main from '@/task/tasas-bce'
import { logger } from '@/utils/logger'
import { cron } from 'bun'

cron('0 8 * * 1-5', async () => {
	logger.info('Running task...')
	await main()
	logger.info('Task completed.')
})
