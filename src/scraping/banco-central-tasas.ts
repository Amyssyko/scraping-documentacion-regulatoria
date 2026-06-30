import puppeteer from 'puppeteer'

const URL_BANCO_CENTRAL_INTERESES =
	'https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm'
function toObject(rows: string[][]): TasaMap {
	const obj: TasaMap = {}
	rows.forEach((r) => {
		for (let i = 0; i < r.length; i += 2) {
			let key = r[i]?.trim()
			const valStr = r[i + 1]?.replace(',', '.')
			if (key && valStr) {
				// Solo limpiar sufijos numéricos si no es un rango de plazo
				if (!key.includes('Plazo')) {
					key = key.replace(/\d+$/, '')
				}
				const val = parseFloat(valStr)
				if (!isNaN(val)) obj[key] = val
			}
		}
	})
	return obj
}

function extractNotas(rows: string[][]): string[] {
	return rows
		.filter(
			(r) =>
				r.length === 1 &&
				r[0] &&
				(r[0].includes('Resolución') || r[0].match(/^\d+\./))
		)
		.map((r) => r[0] as string)
}

function extractUrls(rows: string[][]): string[] {
	return rows
		.flat()
		.filter((cell) => cell.startsWith('http') || cell.startsWith('mailto:'))
}

function parseTasas(data: string[][]): ResultadoTasas {
	try {
		const result: ResultadoTasas = {
			fecha: null,
			tasas_activas_maximas: { valores: {}, notas: [], urls: [] },
			tasas_activas_referenciales: { valores: {}, notas: [], urls: [] },
			tasas_pasivas_promedio: { valores: {}, notas: [], urls: [] },
			tasas_pasivas_por_plazo: { valores: {}, notas: [], urls: [] },
			otras_tasas: { valores: {}, notas: [], urls: [] },
			fuentes: {},
			informacion_historica: { notas: [], url: URL_BANCO_CENTRAL_INTERESES }
		}

		// Fecha
		const fechaRow = data.find(
			(r): r is [string] =>
				r.length === 1 && typeof r[0] === 'string' && /\d{4}/.test(r[0])
		)
		if (fechaRow) result.fecha = fechaRow[0] ?? null

		// Índices de secciones
		const idxMaximas = data.findIndex((r) => r[0]?.includes('ACTIVAS MÁXIMAS'))
		const idxReferenciales = data.findIndex((r) =>
			r[0]?.includes('ACTIVAS EFECTIVAS REFERENCIALES')
		)
		const idxPasivasProm = data.findIndex((r) =>
			r[0]?.includes('PASIVAS EFECTIVAS PROMEDIO')
		)
		const idxPasivasPlazo = data.findIndex((r) =>
			r[0]?.includes('PASIVAS EFECTIVAS REFERENCIALES POR PLAZO')
		)
		const idxOtras = data.findIndex((r) =>
			r[0]?.includes('OTRAS TASAS REFERENCIALES')
		)

		// Sección: Activas Máximas
		if (idxMaximas !== -1 && idxReferenciales !== -1) {
			const sectionRows = data.slice(idxMaximas, idxReferenciales)
			// antes: sectionRows.slice(4)
			result.tasas_activas_maximas.valores = toObject(sectionRows.slice(2))
			result.tasas_activas_maximas.notas = extractNotas(sectionRows)
			result.tasas_activas_maximas.urls = extractUrls(sectionRows)
		}

		// Sección: Activas Referenciales
		if (idxReferenciales !== -1 && idxPasivasProm !== -1) {
			const sectionRows = data.slice(idxReferenciales, idxPasivasProm)
			// antes: sectionRows.slice(4)
			result.tasas_activas_referenciales.valores = toObject(
				sectionRows.slice(2)
			)
			result.tasas_activas_referenciales.notas = extractNotas(sectionRows)
			result.tasas_activas_referenciales.urls = extractUrls(sectionRows)
		}

		// Sección: Pasivas Promedio
		if (idxPasivasProm !== -1 && idxPasivasPlazo !== -1) {
			const sectionRows = data.slice(idxPasivasProm, idxPasivasPlazo)
			result.tasas_pasivas_promedio.valores = toObject(sectionRows.slice(2))
			result.tasas_pasivas_promedio.notas = extractNotas(sectionRows)
			result.tasas_pasivas_promedio.urls = extractUrls(sectionRows)
		}

		// Sección: Pasivas por Plazo
		if (idxPasivasPlazo !== -1 && idxOtras !== -1) {
			const sectionRows = data.slice(idxPasivasPlazo, idxOtras)
			result.tasas_pasivas_por_plazo.valores = toObject(sectionRows.slice(2))
			result.tasas_pasivas_por_plazo.notas = extractNotas(sectionRows)
			result.tasas_pasivas_por_plazo.urls = extractUrls(sectionRows)
		}

		// Sección: Otras Tasas
		if (idxOtras !== -1) {
			const sectionRows = data.slice(idxOtras)
			result.otras_tasas.valores = toObject(sectionRows.slice(1, 4))
			result.otras_tasas.notas = extractNotas(sectionRows)
			result.otras_tasas.urls = extractUrls(sectionRows)
		}

		// Fuentes generales
		result.fuentes.pdf = extractUrls(data).find((u) => u.endsWith('.pdf'))
		result.fuentes.metodologia = extractUrls(data).find((u) =>
			u.includes('Met_TasasReferenciales.pdf')
		)
		result.fuentes.contacto = extractUrls(data).find((u) =>
			u.startsWith('mailto:')
		)
		result.fuentes.resoluciones = extractUrls(data).filter((u) =>
			u.includes('RESOLUCION')
		)
		result.fuentes.historico = extractUrls(data).find((u) =>
			u.includes('TasasHistorico.htm')
		)

		// Información histórica
		const historicoRow = data.find((r) => r[0]?.includes('Indice.htm'))
		const historicoUrl = historicoRow?.[0] ?? URL_BANCO_CENTRAL_INTERESES
		result.informacion_historica = {
			notas: ['5. INFORMACIÓN HISTÓRICA DE TASAS DE INTERÉS REFERENCIALES'],
			url: historicoUrl
		}

		return result
	} catch (err: any) {
		return {
			fecha: null,
			tasas_activas_maximas: { valores: {}, notas: [], urls: [] },
			tasas_activas_referenciales: { valores: {}, notas: [], urls: [] },
			tasas_pasivas_promedio: { valores: {}, notas: [], urls: [] },
			tasas_pasivas_por_plazo: { valores: {}, notas: [], urls: [] },
			otras_tasas: { valores: {}, notas: [], urls: [] },
			fuentes: {},
			informacion_historica: { notas: [], url: URL_BANCO_CENTRAL_INTERESES },
			error: `Error al parsear datos: ${err.message}`
		}
	}
}
export async function scrapeBancoCentral(): Promise<ResultadoTasas> {
	let browser: any | null = null
	try {
		browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.goto(URL_BANCO_CENTRAL_INTERESES)

		const data = await page.evaluate(() => {
			const rows = Array.from(document.querySelectorAll('table tr'))
			return rows
				.map((row) => {
					const cols = row.querySelectorAll('td')
					return Array.from(cols).map((col) => {
						// Si hay un enlace, devolver el href en vez del innerText
						const link = col.querySelector('a')
						if (link) return link.getAttribute('href') || col.innerText.trim()
						return col.innerText.trim()
					})
				})
				.filter((r) => r.length > 0)
		})

		return parseTasas(data)
	} catch (err: any) {
		return {
			fecha: null,
			tasas_activas_maximas: { valores: {}, notas: [] },
			tasas_activas_referenciales: { valores: {}, notas: [] },
			tasas_pasivas_promedio: { valores: {}, notas: [] },
			tasas_pasivas_por_plazo: { valores: {}, notas: [] },
			otras_tasas: { valores: {}, notas: [] },
			fuentes: {},
			informacion_historica: { notas: [], url: URL_BANCO_CENTRAL_INTERESES },
			error: `Error al obtener datos: ${err.message}`
		}
	} finally {
		if (browser) {
			await browser.close()
		}
	}
}
