// src/utils/worker-runner.ts

export function ejecutarWorker(workerUrl: URL): Promise<any> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(workerUrl)

		worker.onmessage = (event) => {
			if (event.data.ok) {
				resolve(event.data.data)
			} else {
				reject(new Error(event.data.error))
			}

			worker.terminate()
		}

		worker.onerror = (error) => {
			reject(error)

			worker.terminate()
		}
	})
}
