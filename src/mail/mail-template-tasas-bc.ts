import { envData } from '@/utils/lib'
import z from 'zod'

function generarCorreo(data: ResultadoTasas): string {
	if (!envData.success) {
		throw new Error(
			'Variables de entorno inválidas: ' +
				JSON.stringify(z.treeifyError(envData.error), null, 2)
		)
	}

	const nombre_negocio = envData.data.NOMBRE_NEGOCIO
	const COLORS = {
		header: '#004422', // Verde oscuro
		background: '#f4f8fb', // Azul muy claro
		text: '#1a1a1a', // Texto principal
		h1: '#004080', // Azul profundo
		h1Border: '#66b2ff', // Azul brillante
		h2: '#003366', // Azul oscuro
		tableBg: '#ffffff', // Fondo tabla
		tableShadow: 'rgba(0,0,0,0.1)',
		thBg: '#004080', // Azul institucional
		thText: '#ffffff',
		tdBorder: '#66b2ff',
		trEven: '#e6f2ff', // Azul muy suave
		highlight: '#004080',
		footer: '#003366'
	}

	const styles = `
    body {
      font-family: Arial, sans-serif;
      background-color: ${COLORS.background};
      color: ${COLORS.text};
      margin: 0;
      padding: 20px;
    }
   .container {
        max-width: 900px;
        margin: 0 auto;
      }
    h1 {
      color: ${COLORS.h1};
      border-bottom: 3px solid ${COLORS.h1Border};
      padding-bottom: 5px;
    }
    h2 {
      color: ${COLORS.h2};
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      background-color: ${COLORS.tableBg};
      box-shadow: 0 2px 6px ${COLORS.tableShadow};
    }
    th {
      background-color: ${COLORS.thBg};
      color: ${COLORS.thText};
      padding: 10px;
      text-align: left;
    }
    td {
      border: 1px solid ${COLORS.tdBorder};
      padding: 10px;
    }
    tr:nth-child(even) {
      background-color: ${COLORS.trEven};
    }
    .highlight {
      color: ${COLORS.highlight};
      font-weight: bold;
    }
    .notes {
      font-size: 0.9em;
      color: ${COLORS.header};
      margin-top: 5px;
      white-space: pre-line;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: ${COLORS.footer};
    }
  `

	// Función auxiliar para renderizar tablas
	const renderTable = (valores: Record<string, number>) =>
		Object.entries(valores)
			.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
			.join('')

	// Función auxiliar para notas
	const renderNotas = (notas?: string[]) =>
		notas && notas.length > 0 ?
			`<div class="notes">${notas.join('\n\n')}</div>`
		:	''

	// Función auxiliar para enlaces
	const renderUrls = (urls?: string[]) =>
		urls && urls.length > 0 ?
			`<ul>${urls.map((u) => `<li><a href="${u}">${u}</a></li>`).join('')}</ul>`
		:	''

	// 📨 HTML del correo
	const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
       <div class="container">
        <h1>Informe de Tasas de Interés - Banco Central del Ecuador ${data.fecha ?? 'N/A'}</h1>
        <p>
          Estimados,<br><br>
          Me permito compartir el informe actualizado de tasas de interés correspondientes a 
          <strong>${data.fecha ?? 'N/A'}</strong>, según la información publicada por el Banco Central del Ecuador.
        </p>

        <h2>Tasas Activas Máximas</h2>
        <table><tr><th>Segmento</th><th>Valor (%)</th></tr>${renderTable(data.tasas_activas_maximas.valores)}</table>
        ${renderNotas(data.tasas_activas_maximas.notas)}
        ${renderUrls(data.tasas_activas_maximas.urls)}

        <h2>Tasas Activas Referenciales</h2>
        <table><tr><th>Segmento</th><th>Valor (%)</th></tr>${renderTable(data.tasas_activas_referenciales.valores)}</table>
        ${renderNotas(data.tasas_activas_referenciales.notas)}
        ${renderUrls(data.tasas_activas_referenciales.urls)}

        <h2>Tasas Pasivas Promedio</h2>
        <table><tr><th>Instrumento</th><th>Valor (%)</th></tr>${renderTable(data.tasas_pasivas_promedio.valores)}</table>
        ${renderNotas(data.tasas_pasivas_promedio.notas)}
        ${renderUrls(data.tasas_pasivas_promedio.urls)}

        <h2>Tasas Pasivas por Plazo</h2>
        <table><tr><th>Plazo</th><th>Valor (%)</th></tr>${renderTable(data.tasas_pasivas_por_plazo.valores)}</table>
        ${renderNotas(data.tasas_pasivas_por_plazo.notas)}
        ${renderUrls(data.tasas_pasivas_por_plazo.urls)}

        <h2>Otras Tasas</h2>
        <table><tr><th>Tipo</th><th>Valor (%)</th></tr>${renderTable(data.otras_tasas.valores)}</table>
        ${renderNotas(data.otras_tasas.notas)}
        ${renderUrls(data.otras_tasas.urls)}

        <h2>Fuentes oficiales</h2>
        <ul>
          <li>Documento PDF: <a href="${data.fuentes.pdf ?? '#'}">${data.fuentes.pdf ?? 'N/A'}</a></li>
          <li>Metodología: <a href="${data.fuentes.metodologia ?? '#'}">${data.fuentes.metodologia ?? 'N/A'}</a></li>
          <li>Contacto: ${data.fuentes.contacto ?? 'N/A'}</li>
          ${
						data.fuentes.resoluciones && data.fuentes.resoluciones.length > 0 ?
							`<li>Resoluciones:<ul>${data.fuentes.resoluciones
								.map((r) => `<li><a href="${r}">${r}</a></li>`)
								.join('')}</ul></li>`
						:	''
					}
          ${
						data.fuentes.historico ?
							`<li>Histórico: <a href="${data.fuentes.historico}">${data.fuentes.historico}</a></li>`
						:	''
					}
        </ul>

        <h2>Información Histórica</h2>
        ${renderNotas(data.informacion_historica?.notas)}
        <p><a href="${data.informacion_historica?.url ?? '#'}">Acceder al histórico de tasas</a></p>

        <p>Quedo atento a cualquier consulta adicional.</p>

        <div class="footer">
          Atentamente,<br>
          <strong>${nombre_negocio}</strong><br>
          Cooperativa de Ahorro y Crédito CACPE Pastaza
        </div>
       </div>
      </body>
    </html>
  `
	return html
}

export { generarCorreo }
