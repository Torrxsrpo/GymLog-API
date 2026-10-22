import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Delega la validación del token en JwtStrategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: unknown, user: TUser | false, info?: { message?: string }): TUser {
    if (err || !user) {
      const missingToken = info?.message === 'No auth token';
      throw new UnauthorizedException(missingToken ? 'Missing access token.' : 'Invalid or expired access token.');
    }
    return user;
  }
}
