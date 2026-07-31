function serializeMessage(message: unknown): string {
	if (message instanceof Error) {
		return `${message.name}: ${message.message}\n${message.stack ?? ''}`
	}

	if (message instanceof Event) {
		return JSON.stringify({
			type: message.type,
			target: message.target?.constructor.name
		})
	}

	if (typeof message === 'object') {
		try {
			return JSON.stringify(message, null, 2)
		} catch {
			return String(message)
		}
	}

	return String(message)
}

export { serializeMessage }
