import { scrapeBancoCentral } from "@/scraping/banco-central-tasas.js"
import { logger } from "./logger.js"
import { marcarComoEnviado, obtenerEjecucionesPendientes, registrarEjecucionSiCambio } from "./db.js"
import { resultadoTasasSchema } from "@/schemas/envSchema.js"
import { generarCorreo } from "@/mail/mail-template-tasas-bc.js"
import { enviarCorreo } from "@/mail/enviarCorreo.js"

async function main() {
    const datos = await scrapeBancoCentral()
    if (datos.error) {
        logger.error(`Error al obtener datos: ${datos.error}`)
        return
    }
    await registrarEjecucionSiCambio(datos)

    //console.log('Datos obtenidos del Banco Central:', datos)


    const respuesta = await obtenerEjecucionesPendientes()

    // Obtener el primer resultado pendiente para procesar (si existe) transformar de Array a Objeto
    const id = respuesta.length > 0 ? respuesta.map(ejec => ejec.id)[0] : undefined

    if (respuesta.length === 0) {
        logger.info('No hay ejecuciones pendientes para enviar.')
        return
    }
    logger.info('Datos obtenidos del Banco Central:')
    //logger.info(JSON.stringify(datos, null, 2))
    // Validar datos de entrada
    const validadoData = resultadoTasasSchema.safeParse(datos)
    if (!validadoData.success) {
        logger.error('Datos de entrada inválidos:')
        logger.error(JSON.stringify(validadoData.error.flatten(), null, 2))
        return
    }

    const emailTasasBC = generarCorreo(validadoData.data)

    if (id === undefined) {
        logger.error('No se encontró una ejecución pendiente para enviar.')
        return
    }


    logger.info('Email generado para Banco Central:')
    //logger.info(JSON.stringify(emailTasasBC, null, 2))

    // Centralizar: primero generas datos, luego los envías
    await enviarCorreo(
        emailTasasBC,
        `Informe Tasas Banco Central - ${validadoData.data.fecha ?? 'Actualización'}`
    )

    await marcarComoEnviado(id)
}

export default main;