import { z } from 'zod'

// ✅ Validación de variables de entorno
const envSchema = z.object({
	EMAIL_HOST: z.string().min(1, 'EMAIL_HOST es requerido'),
	EMAIL_PORT: z.string().transform((val) => parseInt(val, 10)),
	EMAIL_USER: z.string().min(1, 'EMAIL_USER es requerido'),
	EMAIL_PASS: z.string().min(1, 'EMAIL_PASS es requerido'),
	EMAIL_FROM: z.email('EMAIL_FROM debe ser un correo válido'),
	EMAIL_TO: z.string('EMAIL_TO debe ser un correo válido'),
	EMAIL_CC: z.string().optional(),
	EMAIL_BCC: z.string().optional(),
	NOMBRE_NEGOCIO: z.string().min(1, 'NOMBRE_NEGOCIO es requerido')
})

// ✅ Validación de ResultadoTasas con Zod
const tasaMapSchema = z.record(z.string(), z.number())

const apartadoSchema = z.object({
	valores: tasaMapSchema,
	notas: z.array(z.string()).optional(), // puede estar ausente
	urls: z.array(z.string()).optional() // 🔗 enlaces asociados al apartado
})

const fuentesSchema = z.object({
	pdf: z.string().optional(),
	metodologia: z.string().optional(),
	contacto: z.string().optional(),
	resoluciones: z.array(z.string()).optional(), // 🔗 lista de resoluciones
	historico: z.string().optional() // 🔗 enlace al histórico
})

const resultadoTasasSchema = z.object({
	fecha: z.string().nullable(),
	tasas_activas_maximas: apartadoSchema,
	tasas_activas_referenciales: apartadoSchema,
	tasas_pasivas_promedio: apartadoSchema,
	tasas_pasivas_por_plazo: apartadoSchema,
	otras_tasas: apartadoSchema,
	fuentes: fuentesSchema,
	informacion_historica: z
		.object({
			notas: z.array(z.string()),
			url: z.string()
		})
		.optional(),
	error: z.string().optional()
})

type Env = z.infer<typeof envSchema>
type ResultadoTasas = z.infer<typeof resultadoTasasSchema>

export { envSchema, resultadoTasasSchema, type Env, type ResultadoTasas }
