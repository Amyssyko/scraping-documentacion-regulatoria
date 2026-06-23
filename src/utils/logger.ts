// src/utils/logger.ts
import { mkdir } from 'node:fs/promises'
// 🎨 Colores ANSI para consola
const COLORS = {
	info: '\x1b[36m%s\x1b[0m', // Cyan
	warn: '\x1b[33m%s\x1b[0m', // Amarillo
	error: '\x1b[31m%s\x1b[0m', // Rojo
	success: '\x1b[32m%s\x1b[0m' // Verde
}

// 📂 Carpeta de logs
const LOG_DIR = 'logs'

// ✅ Crear carpeta si no existe
try {
	await mkdir(LOG_DIR, { recursive: true })
} catch (err) {
	console.error('No se pudo crear la carpeta de logs:', err)
}

// 📝 Función auxiliar para escribir en archivo con Bun
async function safeWrite(type: string, data: string) {
	try {
		const now = new Date()
		const dateStr = now
			.toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
			.replace(/-/g, '-')
		const file = Bun.file(`${LOG_DIR}/${type}-${dateStr}.log`)

		// 👇 Aquí agregamos doble salto de línea
		const line = `[${now.toLocaleString()}] [${type.toUpperCase()}] ${data}\n`

		// ✅ Usar FileSink para escritura incremental
		const writer = file.writer()
		writer.write(line)
		await writer.flush()
		writer.end()
	} catch (err) {
		console.error('Failed to write log:', err)
	}
}

// 🚀 Logger principal
export const logger = {
	info: async (msg: string) => {
		console.log(COLORS.info, `[INFO] ${msg}`)
		await safeWrite('info', msg)
	},
	warn: async (msg: string) => {
		console.warn(COLORS.warn, `[WARN] ${msg}`)
		await safeWrite('warn', msg)
	},
	error: async (msg: string) => {
		console.error(COLORS.error, `[ERROR] ${msg}`)
		await safeWrite('error', msg)
	},
	success: async (msg: string) => {
		console.log(COLORS.success, `[SUCCESS] ${msg}`)
		await safeWrite('success', msg)
	}
}
