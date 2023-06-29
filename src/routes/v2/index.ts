import { type Request, type Response, Router } from 'express'
import APIError from '@/utils/APIError'
import catchAsync from '@/utils/catchAsync'

const v2Router = Router()

v2Router.get('/', catchAsync(async (_req: Request, _res: Response): Promise<any> => {
  // reject after 1 second
  const pro = new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('This is a test error'))
    }, 500)
  })

  await pro

  throw new APIError(400, 'This is a test error')
})
)

export default v2Router
