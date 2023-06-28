import type APIError from '../types/APIError'

const formatSuccessResponse = ({ message = 'Request processed successfully', ...data }): any => {
  return {
    success: true,
    message,
    data
  }
}

const formatErrorResponse = (err: APIError | Error): any => {
  return {
    success: false,
    message: err.message,
    stack: err.stack
  }
}

export { formatSuccessResponse, formatErrorResponse }
