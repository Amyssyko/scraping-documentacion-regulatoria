type TasaMap = Record<string, number>

interface Apartado {
	valores: TasaMap
	notas?: string[] | undefined
	urls?: string[] | undefined // 🔗 enlaces asociados al apartado (ej. resoluciones PDF)
}

interface Fuentes {
	pdf?: string | undefined
	metodologia?: string | undefined
	contacto?: string | undefined
	resoluciones?: string[] | undefined // 🔗 lista de URLs de resoluciones legales
	historico?: string | undefined // 🔗 enlace al histórico de tasas
}

interface ResultadoTasas {
	fecha: string | null
	tasas_activas_maximas: Apartado
	tasas_activas_referenciales: Apartado
	tasas_pasivas_promedio: Apartado
	tasas_pasivas_por_plazo: Apartado
	otras_tasas: Apartado
	fuentes: Fuentes
	informacion_historica?: { notas: string[]; url: string } | undefined
	error?: string | undefined
}


// Nuevo tipo para la tabla de control
interface Ejecucion {
  id: number;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  fue_enviado: boolean;
  resultado: ResultadoTasas;
}