declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    issuer?: string;
    audience?: string;
    subject?: string;
    algorithm?: string;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string;
    issuer?: string;
    subject?: string;
    clockTolerance?: number;
    maxAge?: string;
  }

  export interface JwtPayload {
    [key: string]: any;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): string | JwtPayload;

  export class JsonWebTokenError extends Error {
    name: 'JsonWebTokenError';
  }

  export class TokenExpiredError extends JsonWebTokenError {
    name: 'TokenExpiredError';
    expiredAt: Date;
  }
}
