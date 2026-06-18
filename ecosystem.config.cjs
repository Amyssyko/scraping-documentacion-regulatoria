module.exports = {
	apps: [
		{
			name: 'scraping-documentacion-regulatoria',
			script: 'bun',
			args: ['run', 'start'],
			exec_mode: 'fork',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '500M',
			env: {
				NODE_ENV: 'production',
				NODE_OPTIONS: '--use-system-ca'
			}
		}
	]
}
