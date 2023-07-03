import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, json } = format

const prodLogger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'prod' }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
})

const devLogger = createLogger({
  level: 'debug',
  transports: [
    new transports.File({ filename: 'logs/dev.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger

export default logger
