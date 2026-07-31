// src/utils/logger.ts

import { mkdir } from 'node:fs/promises'

const COLORS = {
  info: '\x1b[36m%s\x1b[0m',
  warn: '\x1b[33m%s\x1b[0m',
  error: '\x1b[31m%s\x1b[0m',
  success: '\x1b[32m%s\x1b[0m'
}

const LOG_DIR = 'logs'

type LogType = 'info' | 'warn' | 'error' | 'success'

interface LogItem {
  type: LogType
  message: string
  date: Date
}

const buffer: LogItem[] = []

await mkdir(LOG_DIR, { recursive: true })

function addLog(type: LogType, message: string) {
  const item: LogItem = {
    type,
    message,
    date: new Date()
  }

  buffer.push(item)

  const prefix = `[${type.toUpperCase()}] ${message}`

  switch (type) {
    case 'info':
      console.log(COLORS.info, prefix)
      break

    case 'warn':
      console.warn(COLORS.warn, prefix)
      break

    case 'error':
      console.error(COLORS.error, prefix)
      break

    case 'success':
      console.log(COLORS.success, prefix)
      break
  }
}

async function flushLogs() {
  if (buffer.length === 0) {
    return
  }

  const agrupados = buffer
    .map((log) => {
      return `[${log.date.toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
    })
    .join('\n')

  const fecha = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Lima'
  })

  const file = Bun.file(`${LOG_DIR}/app-${fecha}.log`)

  const writer = file.writer()

  writer.write(agrupados + '\n')

  await writer.flush()

  writer.end()

  // limpiar memoria
  buffer.length = 0
}

function getLogs() {
  return [...buffer]
}

export const logger = {
  info(message: string) {
    addLog('info', message)
  },

  warn(message: string) {
    addLog('warn', message)
  },

  error(message: string) {
    addLog('error', message)
  },

  success(message: string) {
    addLog('success', message)
  },

  flush: flushLogs,

  getLogs
}
