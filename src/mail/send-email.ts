import { createEmailTransporter } from './email-config.js'

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
		cc: env.EMAIL_CC,
		bcc: env.EMAIL_BCC,
		subject: subject ?? `Informe - ${date}`,
		html // aquí siempre es string
	}

	try {
		const info = await transporter.sendMail(mailOptions)
		console.log('Correo enviado:', info.messageId)
		return true
	} catch (err) {
		console.error('Error al enviar correo:', err)
		return false
	}
}
