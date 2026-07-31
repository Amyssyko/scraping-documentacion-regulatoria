// src/utils/logger.ts

import { appendFile, mkdir } from 'node:fs/promises'
import { serializeMessage } from './error-handler'

const COLORS = {
	info: '\x1b[36m%s\x1b[0m',
	warn: '\x1b[33m%s\x1b[0m',
	error: '\x1b[31m%s\x1b[0m',
	success: '\x1b[32m%s\x1b[0m'
} as const

const LOG_DIR = 'logs'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Cada cuánto escribir automáticamente en producción.
const AUTO_FLUSH_INTERVAL = 30_000

type LogType = 'info' | 'warn' | 'error' | 'success'

interface LogItem {
	type: LogType
	message: string
	date: Date
}

const buffer: LogItem[] = []

let flushing = false

await mkdir(LOG_DIR, { recursive: true })

function print(type: LogType, message: string) {
	const prefix = `[${type.toUpperCase()}] ${message}`

	switch (type) {
		case 'info':
			console.log(COLORS.info, prefix)
			break

		case 'warn':
			console.warn(COLORS.warn, prefix)
			break

		case 'error':
			console.error(COLORS.error, prefix)
			break

		case 'success':
			console.log(COLORS.success, prefix)
			break
	}
}

function addLog(type: LogType, message: unknown) {
	const text = serializeMessage(message)
	buffer.push({
		type,
		message: text,
		date: new Date()
	})

	print(type, text)

	// En desarrollo escribir inmediatamente
	if (!IS_PRODUCTION) {
		void flushLogs()
	}
}

async function flushLogs() {
	if (flushing || buffer.length === 0) {
		return
	}

	flushing = true

	const pending = buffer.splice(0)

	try {
		const fecha = new Date().toLocaleDateString('en-CA', {
			timeZone: 'America/Lima'
		})

		const content =
			pending
				.map(
					(log) =>
						`[${log.date.toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
				)
				.join('\n') + '\n'

		await appendFile(`${LOG_DIR}/app-${fecha}.log`, content, 'utf8')
	} catch (error) {
		// Reinsertar para no perder información
		buffer.unshift(...pending)

		console.error(COLORS.error, '[LOGGER] Error escribiendo el archivo de logs')

		console.error(error)
	} finally {
		flushing = false

		// Si llegaron nuevos logs mientras escribíamos,
		// programar otro flush.
		if (buffer.length > 0) {
			queueMicrotask(() => {
				void flushLogs()
			})
		}
	}
}

function getLogs() {
	return [...buffer]
}

async function shutdown() {
	try {
		await flushLogs()
	} catch {
		// Ignorar durante el cierre
	}
}

// Autoflush únicamente en producción
if (IS_PRODUCTION) {
	const timer = setInterval(() => {
		void flushLogs()
	}, AUTO_FLUSH_INTERVAL)

	timer.unref()
}

// Cierre normal
process.once('beforeExit', () => {
	void shutdown()
})

// Ctrl+C
process.once('SIGINT', async () => {
	await shutdown()
	process.exit(0)
})

// docker / systemd
process.once('SIGTERM', async () => {
	await shutdown()
	process.exit(0)
})

export const logger = {
	info(message: unknown) {
		addLog('info', message)
	},

	warn(message: unknown) {
		addLog('warn', message)
	},

	error(message: unknown) {
		addLog('error', message)
	},

	success(message: unknown) {
		addLog('success', message)
	},

	flush: flushLogs,

	getLogs
}
