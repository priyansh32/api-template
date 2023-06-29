import { fr } from '@/utils/formatResponse'
import { type Request, type Response, Router } from 'express'

const v1Router = Router()

v1Router.get('/', (req: Request, res: Response) => {
  res.status(200).send(fr({ message: 'Hello, world 1!', apiVersion: req.apiVersion }))
}
)

export default v1Router
