// src/index.ts

import type { CronOptions, CronWithAutocomplete } from 'bun'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getEcuadorDateTime, timezone } from './lib/const'
import { ejecutarWorker } from './utils/worker-runner'

const compiledWorkerUrl = new URL('./worker/index.js', import.meta.url)
const sourceWorkerUrl = new URL('./worker/index.ts', import.meta.url)
const workerUrl = existsSync(fileURLToPath(compiledWorkerUrl)) ? compiledWorkerUrl : sourceWorkerUrl

const options: CronOptions = {
	tz: timezone
}

const cronExpression: CronWithAutocomplete = '0 8,11 * * 1-5'

Bun.cron(
	cronExpression,
	async () => {
		console.log(`[cron] Iniciando ejecución del worker - ${getEcuadorDateTime()} (Ecuador)`)

		try {
			const result = await ejecutarWorker(workerUrl)

			console.log(`[cron] Worker finalizado - ${getEcuadorDateTime()} (Ecuador):`, result)
		} catch (error) {
			console.error(`[cron] Error ejecutando worker - ${getEcuadorDateTime()} (Ecuador):`, error)
		}
	},
	options
)

console.log(`[app] Cron registrado. Esperando ejecución... Hora Ecuador: ${getEcuadorDateTime()}`)
