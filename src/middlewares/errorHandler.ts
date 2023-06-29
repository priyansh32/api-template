import { type ErrorRequestHandler, type Request, type Response, type NextFunction } from 'express'
import logger from '@/utils/logger'
import APIError from '@/utils/APIError'
import { fe } from '@/utils/formatResponse'

const errorHandler: ErrorRequestHandler = (
  error: APIError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error: ', error)

  const response = fe(error)

  let status = 500
  if (error instanceof APIError) {
    status = error.statusCode
  }
  res.status(status).json(response)
}

export default errorHandler
