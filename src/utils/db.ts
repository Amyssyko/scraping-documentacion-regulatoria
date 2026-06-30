import { Database } from 'bun:sqlite'

const db = new Database('control_ejecuciones.sqlite')

db.run(`
  CREATE TABLE IF NOT EXISTS ejecuciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT,
    fue_enviado INTEGER DEFAULT 0,
    resultado TEXT NOT NULL
  )
`)

function registrarEjecucion(resultado: ResultadoTasas): void {
	const fecha = new Date().toLocaleString()

	db.run(`INSERT INTO ejecuciones (fecha_creacion, resultado) VALUES (?, ?)`, [
		fecha,
		JSON.stringify(resultado)
	])
}

function marcarComoEnviado(id: number): void {
	const fecha = new Date().toLocaleString()

	db.run(
		`UPDATE ejecuciones 
     SET fue_enviado = 1, fecha_actualizacion = ? 
     WHERE id = ?`,
		[fecha, id]
	)
}

// Obtener último registro
function obtenerUltimaEjecucion(): Ejecucion | null {
	const query = db.query<
		{
			id: number
			fecha_creacion: string
			fecha_actualizacion: string | null
			fue_enviado: number
			resultado: string
		},
		[]
	>(`SELECT * FROM ejecuciones ORDER BY id DESC LIMIT 1`)

	const row = query.get()
	if (!row) return null

	return {
		id: row.id,
		fecha_creacion: row.fecha_creacion,
		fecha_actualizacion: row.fecha_actualizacion,
		fue_enviado: Boolean(row.fue_enviado),
		resultado: JSON.parse(row.resultado) as ResultadoTasas
	}
}

// Consultar ejecuciones pendientes con tipado
function obtenerEjecucionesPendientes(): Ejecucion[] {
	const query = db.query<
		{
			id: number
			fecha_creacion: string
			fecha_actualizacion: string | null
			fue_enviado: number
			resultado: string
		},
		[]
	>(
		`SELECT id, fecha_creacion, fecha_actualizacion, fue_enviado, resultado 
     FROM ejecuciones 
     WHERE fue_enviado = 0`
	)

	const rows = query.all()

	return rows.map((row) => ({
		id: row.id,
		fecha_creacion: row.fecha_creacion,
		fecha_actualizacion: row.fecha_actualizacion,
		fue_enviado: Boolean(row.fue_enviado),
		resultado: JSON.parse(row.resultado) as ResultadoTasas
	}))
}
function sonIguales(a: ResultadoTasas, b: ResultadoTasas): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}

function registrarEjecucionSiCambio(resultado: ResultadoTasas): void {
	const ultima = obtenerUltimaEjecucion()
	if (ultima && sonIguales(ultima.resultado, resultado)) {
		console.log(
			'No se insertó: la información es idéntica a la última ejecución.'
		)
		return
	}

	const fecha = new Date().toLocaleString()
	db.run(`INSERT INTO ejecuciones (fecha_creacion, resultado) VALUES (?, ?)`, [
		fecha,
		JSON.stringify(resultado)
	])
	console.log('Nueva ejecución registrada en la base de datos.')
}

export {
	marcarComoEnviado,
	obtenerEjecucionesPendientes,
	obtenerUltimaEjecucion,
	registrarEjecucion,
	registrarEjecucionSiCambio
}
