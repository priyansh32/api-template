import { type Request, type Response, Router } from 'express'
import APIError from '../../types/APIError'

const v2Router = Router()

v2Router.get('/', async (_req: Request, _res: Response): Promise<any> => {
  // reject after 1 second
  await new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new APIError(500, 'timeout'))
    }, 1000)
  })

  throw new APIError(400, 'This is a test error')
}
)

export default v2Router
