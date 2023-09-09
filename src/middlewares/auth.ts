import { type RequestHandler, type Request, type Response, type NextFunction } from 'express'
import APIError from '@/utils/APIError'
import jwt from 'jsonwebtoken'

const authHandler: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers
  if (authorization == null) {
    next(new APIError(401, 'Unauthorized')); return
  }

  const [type, token] = authorization.split(' ')
  if (type !== 'Bearer') {
    throw new APIError(401, 'Unauthorized')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

    if (typeof decoded === 'string' || typeof decoded !== 'object') {
      throw new APIError(401, 'Unauthorized')
    }

    req.user = {
      id: decoded.id
    }
  } catch (err) {
    throw new APIError(401, 'Unauthorized')
  }

  next()
}

export default authHandler
