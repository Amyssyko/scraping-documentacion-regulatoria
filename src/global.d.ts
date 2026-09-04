type TResponse<T = unknown> = {
	success: boolean
	total: number
	data?: T
	error?: string
	details?: unknown
}

type ResultaTask = {
	name: string
	details?: string
	processed: number
}
