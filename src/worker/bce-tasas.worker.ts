import { taskTasasBCE } from '@/task/tasas-bce'

taskTasasBCE()
  .then((resultado) => {
    postMessage({
      ok: true,
      data: resultado
    })
  })
  .catch((error) => {
    postMessage({
      ok: false,
      error: error.message
    })
  })
