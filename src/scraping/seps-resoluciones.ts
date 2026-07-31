import type { Documento } from '@/type'
import { calcularTimeout, medirTiempoRespuesta } from '@/utils/calculate-time'
import { verificarUrl } from '@/utils/checkUrl'
import { serializeMessage } from '@/utils/error-handler'
import { logger } from '@/utils/logger'
import puppeteer from 'puppeteer'

const URL_SEPS =
	'https://www.seps.gob.ec/resoluciones-de-entidades-del-sector-financiero-popular-y-solidario/'

interface ResolucionRaw {
	resolucion: string
	tema: string
	descripcion: string
	fecha: string | null
	pdf: string
}

function normalizarTexto(texto: string): string {
	return texto
		.replace(/\u00A0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function parseFecha(fecha: string): string | null {
	if (!fecha) {
		return null
	}

	const partes = fecha.split('/')

	if (partes.length === 3) {
		const [mes, dia, anio] = partes

		return `${anio}-${mes}-${dia}`
	}

	return fecha
}

function parseResoluciones(data: string[][]): Documento[] {
	const documentos: ResolucionRaw[] = data
		.map((row) => ({
			resolucion: normalizarTexto(row[0] ?? ''),

			tema: normalizarTexto(row[1] ?? ''),

			descripcion: normalizarTexto(row[2] ?? ''),

			fecha: parseFecha(row[3] ?? ''),

			pdf: row[4] ?? ''
		}))
		.filter((x) => x.resolucion && x.pdf)

	return documentos.map((doc) => ({
		fuente: 'SEPS',

		categoria: 'Resoluciones',

		titulo: doc.resolucion,

		descripcion: `${doc.tema}\n\n${doc.descripcion}`,

		fecha: doc.fecha,

		url: doc.pdf,

		pdf: true
	}))
}

function validarResultado(data: Documento[]) {
	if (!data.length) {
		throw new Error('SEPS no devolvió resoluciones')
	}
}

const segundos = 10

const milisegundos = segundos * 1000

export async function scrapeResolucionesSEPS(): Promise<Documento[]> {
	const health = await verificarUrl(URL_SEPS, 30000)

	console.log({
		pagina: URL_SEPS,
		disponible: health.disponible,
		status: health.status,
		tiempo: `${health.tiempoRespuestaMs} ms`,
		error: health.error
	})

	if (!health.disponible) {
		// Si la página no está disponible, no se puede continuar con el scraping
		// Notificar que la página no está disponible y retornar un arreglo vacío
		return []
	}

	const tiempo = await medirTiempoRespuesta(URL_SEPS)

	console.log(`SEPS responde en ${tiempo.milisegundos} ms`)

	const timeout = calcularTimeout(tiempo.milisegundos)

	console.log(`Timeout configurado: ${timeout} ms`)
	let browser: any | null = null

	try {
		browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.setCacheEnabled(false)

		await page.goto(URL_SEPS, {
			waitUntil: 'networkidle2',

			timeout: milisegundos
		})

		await page.waitForFunction(
			() => {
				const filas = document.querySelectorAll('table tbody tr')

				return filas.length > 0
			},

			{
				timeout: milisegundos
			}
		)

		const data = await page.evaluate(() => {
			const tabla = Array.from(document.querySelectorAll('table')).find(
				(table) => {
					const texto = table.textContent?.toLowerCase() ?? ''

					return (
						texto.includes('resolución') &&
						texto.includes('tema') &&
						texto.includes('fecha')
					)
				}
			)

			if (!tabla) {
				return []
			}

			return Array.from(tabla.querySelectorAll('tbody tr'))
				.map((row) => {
					const cols = Array.from(row.querySelectorAll('td'))

					return cols.map((col) => {
						const link = col.querySelector('a')

						if (link) {
							return link.getAttribute('href') ?? ''
						}

						return col.textContent?.trim() ?? ''
					})
				})
				.filter((row) => row.length >= 5)
		})

		const resultado = parseResoluciones(data)

		validarResultado(resultado)
		console.log(`SEPS devolvió ${resultado.length} resoluciones`)

		return resultado
	} catch (err: any) {
		logger.error(serializeMessage(err))
		return []
	} finally {
		if (browser) {
			await browser.close()
		}
	}
}
