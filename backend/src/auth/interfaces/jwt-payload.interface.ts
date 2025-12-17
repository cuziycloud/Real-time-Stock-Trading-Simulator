export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}
