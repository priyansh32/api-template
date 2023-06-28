import { type Request, type Response, Router } from 'express'

const v1Router = Router()

v1Router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello, world 1!')
}
)

export default v1Router
