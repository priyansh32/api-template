import mongoose from 'mongoose'
import logger from '@/utils/logger'

const DB_URL = (process.env.DB_URL !== undefined) ? process.env.DB_URL : 'mongodb://localhost:27017'

mongoose.connect(DB_URL)
  .then(() => {
    logger.info('Connected to database')
  })
  .catch((err: Error) => {
    logger.error("Couldn't connect to database: ", err)
    process.exit(1)
  })

const db = mongoose.connection

db.on('error', (err: Error) => {
  logger.error('Database error: ', err)
})

db.on('open', () => {
  logger.info('Database connection opened')
})
