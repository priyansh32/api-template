import { type ErrorRequestHandler, type Request, type Response, type NextFunction } from 'express'
import logger from '../utils/logger'
import APIError from '../types/APIError'
import { formatErrorResponse } from '../utils/formatResponse'

const errorHandler: ErrorRequestHandler = (
  error: APIError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error: ', error.name, error.message, error.stack)

  const response = formatErrorResponse(error)

  let status = 500
  if (error instanceof APIError) {
    status = error.statusCode
  }
  res.status(status).json(response)
}

export default errorHandler
