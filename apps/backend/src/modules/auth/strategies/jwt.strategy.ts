import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthenticatedUser } from '@citassistema/shared-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'citassistema-jwt-secret-key-2026',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload || !payload.sub || !payload.clinicId) {
      throw new UnauthorizedException('Token de autenticación malformado o inválido.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      clinicId: payload.clinicId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
