import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { LoginUserUseCase } from './application/use-cases/login-User.CaseUse.js';
import { TOKEN_SERVICE } from './domain/ports/TokenService.port.js';
import { PASSWORD_HASHER } from './domain/ports/PasswordHasher.port.js';
import { AuthController } from './infrastructure/http/controllers/Auth.controller.js';
import { JwtTokenService } from './infrastructure/security/JwtToken.service.js';
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.service.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from './infrastructure/guards/roles.guard.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    //cases uses
    CreateUserUseCase,
    LoginUserUseCase,

    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    JwtStrategy,

    // Guards globales: toda ruta exige token y rol USER salvo las marcadas con @Public()
    // El orden importa: primero autentica JwtAuthGuard y luego autoriza RolesGuard
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
