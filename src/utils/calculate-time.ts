interface TiempoRespuesta {
  disponible: boolean
  status: number | null
  milisegundos: number
}

export async function medirTiempoRespuesta(
  url: string
): Promise<TiempoRespuesta> {
  const inicio = performance.now()

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })

    const fin = performance.now()

    return {
      disponible: response.ok,
      status: response.status,
      milisegundos: Math.round(fin - inicio)
    }
  } catch {
    return {
      disponible: false,
      status: null,
      milisegundos: Math.round(performance.now() - inicio)
    }
  }
}

export function calcularTimeout(
  milisegundos: number,
  minimo = 30000,
  maximo = 180000
) {
  const timeout = milisegundos * 3

  return Math.min(Math.max(timeout, minimo), maximo)
}
