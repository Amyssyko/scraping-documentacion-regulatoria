import { Temporal } from '@js-temporal/polyfill'

export const timezone = 'America/Guayaquil'

export const getEcuadorDateTime = () => Temporal.Now.zonedDateTimeISO(timezone).toString()
