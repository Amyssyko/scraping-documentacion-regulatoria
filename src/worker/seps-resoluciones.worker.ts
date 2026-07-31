import { scrapeResolucionesSEPS } from '@/scraping/seps-resoluciones'

scrapeResolucionesSEPS()
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
