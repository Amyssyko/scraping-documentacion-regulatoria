import { logger } from '@/utils/logger'
import { createEmailTransporter } from './email-config'

// Función genérica para enviar correos con validación Zod
export async function enviarCorreo(html: string, subject?: string) {
	// Validar datos de entrada con el esquema proporcionado

	// Obtener transporter y variables de entorno
	const { transporter, env } = createEmailTransporter()

	// Generar HTML usando la función pasada o una por defecto

	const date = new Date().toLocaleString('es-EC', {
		timeZone: 'America/Guayaquil',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})


	const mailOptions = {
		from: env.EMAIL_FROM,
		to: env.EMAIL_TO,
		cc: env.EMAIL_CC!,
		bcc: env.EMAIL_BCC!,
		subject: subject ?? `Informe - ${date}`,
		html // aquí siempre es string
	}

	try {
		logger.info(`Verificando servidor de correo...`)	
        const response = await transporter.verify()
		logger.info(`Respuesta de verificación: ${response}`)

		if (!response) {
			logger.error('No se pudo verificar el servidor de correo.')
			return false
		}

		logger.info('Servidor verificado correctamente. Enviando correo...')

		const info = await transporter.sendMail(mailOptions)
		logger.info(`Correo enviado: ${info.messageId}`)
		return true
	} catch (err) {
		logger.error(`Error al enviar correo: ${err}`)
		return false
	}
}
