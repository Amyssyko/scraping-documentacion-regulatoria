import { z } from 'zod'

export const DocumentoSchema = z.object({
	fuente: z.string(),

	categoria: z.string(),

	titulo: z.string(),

	descripcion: z.string(),

	fecha: z.string().nullable(),

	url: z.string().url(),

	pdf: z.boolean()
})
