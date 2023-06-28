import express from 'express'

// services
import './database'
import logger from './utils/logger'
import errorHandler from './middlewares/errorHandler'
import router from './routes'
import apiVersionExtractor from './middlewares/apiVersionExtractor'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string
    }
    apiVersion: string
  }
}

const PORT = (process.env.PORT != null) ? process.env.PORT : 3000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(apiVersionExtractor)
app.use('/', router)
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`)
})
