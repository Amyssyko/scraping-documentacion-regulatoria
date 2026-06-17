import nodemailer from 'nodemailer'
import { envData } from '@/utils/lib.js'

// Configuración del transporter validada
export function createEmailTransporter() {
	
	if (!envData.success) {
		throw new Error(
			'Variables de entorno inválidas: ' +
				JSON.stringify(envData.error.message, null, 2)
		)
	}

	const env = envData.data

	return {
		transporter: nodemailer.createTransport({
			host: env.EMAIL_HOST,
			port: env.EMAIL_PORT || 587,
			secure: false,
			auth: {
				user: env.EMAIL_USER,
				pass: env.EMAIL_PASS
			}
		}),
		env
	}
}
