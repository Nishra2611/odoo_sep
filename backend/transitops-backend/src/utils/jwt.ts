import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function signAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET || JWT_SECRET;
  const expires = process.env.JWT_ACCESS_TTL || '15m';
  return jwt.sign(payload, secret, { expiresIn: expires } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
  const expires = process.env.JWT_REFRESH_TTL || '7d';
  return jwt.sign(payload, secret, { expiresIn: expires } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const secret = process.env.JWT_ACCESS_SECRET || JWT_SECRET;
    return jwt.verify(token, secret) as TokenPayload;
  } catch (err) {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
