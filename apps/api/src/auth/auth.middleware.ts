import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.service';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  const token = header.replace('Bearer ', '');
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  (req as any).user = user;
  next();
}
