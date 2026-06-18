import { envData } from '@/utils/lib'
import nodemailer from 'nodemailer'
import z from 'zod'

// Configuración del transporter validada
export function createEmailTransporter() {
	if (!envData.success) {
		throw new Error(
			'Variables de entorno inválidas: ' +
				JSON.stringify(z.treeifyError(envData.error), null, 2)
		)
	}

	const env = envData.data

	return {
		transporter: nodemailer.createTransport({
			host: env.EMAIL_HOST,
			port: 465,
			secure: true,
			auth: {
				user: env.EMAIL_USER,
				pass: env.EMAIL_PASS
			}
		}),
		tls: { rejectUnauthorized: false },
		env
	}
}
