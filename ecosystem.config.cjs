module.exports = {
	apps: [
		{
			name: 'scraping-documentacion-regulatoria',
			script: 'bun',
			args: 'run start',
			interpreter: 'none',
			exec_mode: 'fork',
			instances: 1,
			autorestart: true,
			watch: true,
			max_memory_restart: '500M',
			out_file: './logs/out.log',
			error_file: './logs/error.log',
			time: true,
			env: {
				NODE_ENV: 'production'
			}
		}
	]
}
