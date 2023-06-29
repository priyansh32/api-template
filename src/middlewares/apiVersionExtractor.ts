import type { NextFunction, Request, Response } from 'express'

const SUPPORTED_VERSIONS = ['1', '2']
const DEFAULT_VERSION = '1'

const apiVersionExtractor = (req: Request, res: Response, next: NextFunction): void => {
  let versionHeader = req.headers['accept-version']
  if (Array.isArray(versionHeader)) {
    versionHeader = versionHeader[0]
  }

  if (versionHeader === undefined || versionHeader === '' || !SUPPORTED_VERSIONS.includes(versionHeader)) {
    req.apiVersion = DEFAULT_VERSION
    next()
  } else {
    req.apiVersion = versionHeader
    next()
  }
}

export default apiVersionExtractor
