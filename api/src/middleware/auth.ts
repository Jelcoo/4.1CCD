import { NextFunction, Request, Response } from 'express';

const authenticationToken = process.env.ACCESS_TOKEN ?? '';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const strippedToken = token.replace('Bearer ', '');

  if (strippedToken !== authenticationToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}
