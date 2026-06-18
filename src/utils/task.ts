import { generarCorreo } from '@/mail/mail-template-tasas-bc.js'
import { enviarCorreo } from '@/mail/send-email.js'
import { resultadoTasasSchema } from '@/schemas/envSchema.js'
import { scrapeBancoCentral } from '@/scraping/banco-central-tasas.js'
import z from 'zod'
import {
	marcarComoEnviado,
	obtenerEjecucionesPendientes,
	registrarEjecucionSiCambio
} from './db.js'
import { logger } from './logger.js'

async function main() {
	const datos = await scrapeBancoCentral()
	if (datos.error || datos.fecha === null) {
		logger.error(`Error al obtener datos: ${datos.error}`)
		return
	}
	await registrarEjecucionSiCambio(datos)

	const respuesta = await obtenerEjecucionesPendientes()

	const id =
		respuesta.length > 0 ? respuesta.map((ejec) => ejec.id)[0] : undefined

	if (respuesta.length === 0) {
		logger.info('No hay ejecuciones pendientes para enviar.')
		return
	}
	logger.info('Datos obtenidos del Banco Central:')

	const validadoData = resultadoTasasSchema.safeParse(datos)
	if (!validadoData.success) {
		logger.error('Datos de entrada inválidos:')
		logger.error(JSON.stringify(z.treeifyError(validadoData.error), null, 2))
		return
	}

	const emailTasasBC = generarCorreo(validadoData.data)

	if (id === undefined) {
		logger.error('No se encontró una ejecución pendiente para enviar.')
		return
	}

	logger.info('Email generado para Banco Central:')

	const correoEnviado = await enviarCorreo(
		emailTasasBC,
		`Informe Tasas Banco Central - ${validadoData.data.fecha ?? 'Actualización'}`
	)

	if (!correoEnviado) {
		logger.error('No se pudo enviar el correo.')
		return
	}

	await marcarComoEnviado(id)
	logger.info('Correo marcado como enviado en la base de datos.')
}

export default main
