import type APIError from './APIError'

interface SuccessResponse {
  success: boolean
  message: string
  data?: any
}

interface ErrorResponse {
  success: boolean
  message: string
  stack?: string
}

const formatSuccessResponse = ({ message = 'Request processed successfully', ...data }): SuccessResponse => {
  const response: SuccessResponse = {
    success: true,
    message
  }

  if (Object.keys(data).length > 0) {
    response.data = data
  }

  return response
}

const formatErrorResponse = (err: APIError | Error): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    message: err.message
  }
  if (process.env.NODE_ENV === 'development') { response.stack = err.stack }
  return response
}

export { formatSuccessResponse as fr, formatErrorResponse as fe }
