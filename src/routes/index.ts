import { type NextFunction, type Request, type Response, Router, type RequestHandler } from 'express'
import v1Router from './v1'
import v2Router from './v2'
import APIError from '../types/APIError'

const router = Router()

const ROUTERS: Record<string, RequestHandler> = {
  1: v1Router,
  2: v2Router
}

const getRouter = (req: Request, res: Response, next: NextFunction): void => {
  console.log('req.apiVersion: ', req.apiVersion)
  const versionRouter = ROUTERS[req.apiVersion]
  if (versionRouter !== undefined) {
    versionRouter(req, res, next)
  } else {
    throw new APIError(404, 'API version not found')
  }
}

router.use('/', getRouter)

export default router
