import { generarCorreo } from '@/mail/mail-template-tasas-bc'
import { enviarCorreo } from '@/mail/send-email'
import { resultadoTasasSchema } from '@/schemas/envSchema'
import { scrapeBancoCentral } from '@/scraping/banco-central-tasas'
import {
	marcarComoEnviado,
	obtenerEjecucionesPendientes,
	registrarEjecucionSiCambio
} from '@/utils/db'
import { logger } from '@/utils/logger'
import z from 'zod'

async function taskTasasBCE(): Promise<ResultaTask> {
	logger.info('Iniciando tarea de scraping de tasas del Banco Central...')
	const datos = await scrapeBancoCentral()
	if (datos.error || datos.fecha === null) {
		logger.error(`Error al obtener datos: ${datos.error}`)
		return {
			name: 'taskTasasBCE',
			details: datos.error ?? 'Error desconocido',
			processed: 0
		}
	}

	await registrarEjecucionSiCambio(datos)

	const respuesta = await obtenerEjecucionesPendientes()

	const id = respuesta.length > 0 ? respuesta.map((ejec) => ejec.id)[0] : undefined

	if (respuesta.length === 0) {
		logger.info('No hay ejecuciones pendientes para enviar.')
		return {
			name: 'taskTasasBCE',
			details: 'No hay ejecuciones pendientes para enviar.',
			processed: 0
		}
	}
	logger.info('Datos obtenidos del Banco Central:')

	const validadoData = resultadoTasasSchema.safeParse(datos)
	if (!validadoData.success) {
		logger.error('Datos de entrada inválidos:')
		logger.error(JSON.stringify(z.treeifyError(validadoData.error), null, 2))
		return {
			name: 'taskTasasBCE',
			details: 'Datos de entrada inválidos',
			processed: 0
		}
	}

	const emailTasasBC = generarCorreo(validadoData.data)

	if (id === undefined) {
		logger.error('No se encontró una ejecución pendiente para enviar.')
		return {
			name: 'taskTasasBCE',
			details: 'No se encontró una ejecución pendiente para enviar.',
			processed: 0
		}
	}

	logger.info('Email generado para Banco Central:')
	const correoEnviado = await enviarCorreo(
		emailTasasBC,
		`Informe Tasas Banco Central - ${validadoData.data.fecha ?? 'Actualización'}`
	)

	if (!correoEnviado) {
		logger.error('No se pudo enviar el correo.')
		return {
			name: 'taskTasasBCE',
			details: 'No se pudo enviar el correo.',
			processed: 0
		}
	}

	await marcarComoEnviado(id)
	logger.info('Correo marcado como enviado en la base de datos.')
	return {
		name: 'taskTasasBCE',
		details: 'Correo enviado correctamente.',
		processed: 1
	}
}

export { taskTasasBCE }
